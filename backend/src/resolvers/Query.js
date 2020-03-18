const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
	items: forwardTo('db'),
	item: forwardTo('db'),
	itemsConnection: forwardTo('db'),
	me(parent, args, ctx, info) {
		if (!ctx.request.userId) {
			return null;
		}
		return ctx.db.query.user(
			{
				where: { id: ctx.request.userId }
			},
			info
		);
	},
	async users(parent, args, ctx, info) {
		//CHeck if they are logged in
		if (!ctx.request.userId) {
			throw new Error('You mus tbe logged in');
		}
		//Check if the user has permissio s to get all users
		hasPermission(ctx.request.user, [ 'ADMIN', 'PERMISSIONUPDATE' ]);
		return ctx.db.query.users({}, info);
		//if they do, query all users
	}
};

module.exports = Query;
