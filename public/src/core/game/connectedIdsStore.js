export function createConnectedIdsStore() {
    let ids = [];

    function normalize(input) {
        if (!Array.isArray(input)) return [];
        return input.map((x) => String(x));
    }

    return {
        set(next) {
            ids = normalize(next);
        },

        get() {
            return ids;
        },

        getOverlayIds({ maxChars = 6, maxLines = 12 } = {}) {
            const out = [];
            for (let i = 0; i < ids.length && out.length < maxLines; i++) {
                const s = String(ids[i]);
                out.push(s.length <= maxChars ? s : s.slice(-maxChars));
            }
            return out;
        },
    };
}
