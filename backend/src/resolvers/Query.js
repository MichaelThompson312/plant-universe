const { forwardTo } = require('prisma-binding');

const Query = {
	items: forwardTo('db')
	//async items(paretns, args, ctx, info) {
	//	const items = await ctx.db.query.items();
	//	return items;
	//}
};

module.exports = Query;
