import users from './users.js';
import db from './database.js';
import messages from './messages.js';
import constants from './constants.js';

export default { ...users, ...db, ...messages, ...constants }
