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
	},
	async order(parent, args, ctx, info) {
		//make sure they are logged in
		if (!ctx.request.userId) {
			throw new Error('You arent logged in!');
		}
		//query current order
		const order = await ctx.db.query.order(
			{
				where: { id: args.id }
			},
			info
		);
		// Check if they have permissions to see the order
		const ownsOrder = order.user.id === ctx.request.userId;
		const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
		if (!ownsOrder || !hasPermissionToSeeOrder) throw new Error('You are not allowed');
		//return the order
		return order;
	},
	async orders(parent, args, ctx, info) {
		const { userId } = ctx.request;
		if (!userId) {
			throw new Error('you must be signed in!');
		}
		return ctx.db.query.orders(
			{
				where: {
					user: { id: userId }
				}
			},
			info
		);
	}
};

module.exports = Query;
