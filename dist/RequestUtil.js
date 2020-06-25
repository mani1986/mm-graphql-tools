"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
class RequestUtil {
    static makeSubscription($apollo, query, variables, onUpdate) {
        const store = JSON.parse(window.localStorage.getItem('capman'));
        try {
            const request = $apollo.subscribe({
                query,
                variables: Object.assign({ token: lodash_1.default.get(store, 'auth.token') }, variables),
                updateQuery(prev, res) {
                    console.log('ok', prev, res.subscriptionData);
                }
            });
            return request.subscribe({
                next(data) {
                    onUpdate(data.data);
                },
                error(error) {
                    throw error;
                }
            });
        }
        catch (e) {
            throw e;
        }
    }
    static async makeQuery($apollo, query, variables) {
        try {
            const request = await $apollo.query({
                query,
                variables,
            });
            return RequestUtil.handleRequestOutput(request);
        }
        catch (e) {
            throw e;
        }
    }
    static async makeMutation($apollo, mutation, variables) {
        try {
            const request = await $apollo.mutate({
                mutation,
                variables,
            });
            return RequestUtil.handleRequestOutput(request);
        }
        catch (e) {
            throw e;
        }
    }
    static handleRequestOutput(request) {
        const errors = lodash_1.default.get(request, 'errors', []);
        if (errors.length && lodash_1.default.get(errors, '0.message') === 'GraphQL error: You do not have permission to perform this action') {
            throw new Error('Not authorized');
        }
        const data = lodash_1.default.get(request, 'data');
        if (Object.values(data).length === 1) {
            return lodash_1.default.first(Object.values(data));
        }
        return data;
    }
}
exports.default = RequestUtil;
;
//# sourceMappingURL=RequestUtil.js.map