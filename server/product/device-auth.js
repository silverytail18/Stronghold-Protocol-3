import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {chmodSync} from 'node:fs';
const fingerprint=user=>createHash('sha256').update(JSON.stringify([user.accountId,user.passwordHash,user.role,user.disabled,user.mustChangePassword])).digest('hex');
export class DeviceAuth {
  constructor(filename) {
    this.db=new DatabaseSync(filename||':memory:');
    this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS devices(key TEXT PRIMARY KEY,account_id TEXT NOT NULL,username TEXT NOT NULL,fingerprint TEXT NOT NULL,label TEXT NOT NULL,created_at INTEGER NOT NULL,last_used INTEGER NOT NULL,expires_at INTEGER NOT NULL)');
    if(filename&&filename!==':memory:')try{chmodSync(filename,0o600);}catch{/* Windows uses the parent directory ACL. */}
  }
  remember(key,user,expiresAt,label,now) {
    this.db.prepare('DELETE FROM devices WHERE expires_at<=?').run(now);
    this.db.prepare('INSERT INTO devices VALUES(?,?,?,?,?,?,?,?)').run(key,user.accountId,user.username,fingerprint(user),label,now,now,expiresAt);
  }
  restore(key,users,now) {
    const row=this.db.prepare('SELECT * FROM devices WHERE key=?').get(key);
    if(!row)return null;
    const user=users.get(row.username);
    if(!user||user.disabled||user.mustChangePassword||row.expires_at<=now||row.fingerprint!==fingerprint(user)){this.revoke(key);return null;}
    if(now-row.last_used>60000)this.db.prepare('UPDATE devices SET last_used=? WHERE key=?').run(now,key);
    return {key,username:user.username,expiresAt:row.expires_at,sockets:new Set(),remembered:true};
  }
  list(accountId,key) {return this.db.prepare('SELECT key,label,created_at,last_used,expires_at FROM devices WHERE account_id=? ORDER BY last_used DESC').all(accountId).map(row=>({id:row.key,current:row.key===key,label:row.label,createdAt:row.created_at,lastUsed:row.last_used,expiresAt:row.expires_at}));}
  revoke(key) {this.db.prepare('DELETE FROM devices WHERE key=?').run(key);}
  revokeUser(username) {this.db.prepare('DELETE FROM devices WHERE username=?').run(username);}
  close() {this.db.close();}
}
