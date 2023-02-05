import users from './users.js';
import db from './database.js';
import messages from './messages.js';

export default { ...users, ...db, ...messages }
