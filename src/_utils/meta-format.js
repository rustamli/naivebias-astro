export default {
    format(meta) {
        const out = {};
        meta.forEach((item) => {
            if (item.property) {
                out[item.property] = item.content;
            } else if (item.name) {
                out[item.name] = item.content;
            }
        })
        return out;
    }
}
