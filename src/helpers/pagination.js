/*TODO: Find a way to paginate better,

*/

export async function paginateQuery(query, page, limit, sortField) {
    const current_page = !page || isNaN(parseInt(page)) ? 1 : Math.max(1, parseInt(page));
    const skip = (current_page - 1) * limit;

    const [data, total_items] = await Promise.all([
        query.sort({ [sortField]: -1 }).skip(skip).limit(limit).exec(),
        query.model.countDocuments(query.getQuery()) // count with same filters
    ]);

    const total_pages = Math.ceil(total_items / limit);

    return { data, current_page, total_pages };
}


/* TODO: Refactor to use res.locals wherever possible.

     Instead of passing pagination variables directly in res.render(),
     set them in res.locals to reduce redundancy and improve readability.

     Keeps res.render() cleaner and allows reusable middlewares/helpers
     to inject data automatically into the view.
*/
export async function paginateModelView(res, model, page, limit, sortField, name) {
    const current_page = !page || isNaN(parseInt(page)) ? 1 : Math.max(1, parseInt(page));
    const skip = (current_page - 1) * limit;

    const [data, total_items] = await Promise.all([
        model.find().sort({ [sortField]: -1 }).skip(skip).limit(limit),
        model.countDocuments()
    ]);

    const total_pages = Math.ceil(total_items / limit);

    res.locals[name] = data;
    res.locals[`${name}Page`] = current_page;
    res.locals[`${name}TotalPages`] = total_pages;
    res.locals[`${name}Prev`] = current_page > 1 ? current_page - 1 : null;
    res.locals[`${name}Next`] = current_page < total_pages ? current_page + 1 : null;
}



