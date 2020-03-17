const { forwardTo } = require('prisma-binding');

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
	}

	//async items(paretns,args, ctx, info) {
	//	const items = await ctx.db.query.items();
	//	return items;
	//}
};

module.exports = Query;
