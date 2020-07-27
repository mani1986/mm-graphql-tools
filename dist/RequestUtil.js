"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const Bus_1 = __importDefault(require("./Bus"));
class RequestUtil {
    static makeSubscription($apollo, query, variables, onUpdate) {
        const store = JSON.parse(window.localStorage.getItem('mm'));
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
                    return RequestUtil.handleError(error);
                }
            });
        }
        catch (e) {
            return RequestUtil.handleError(e);
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
            return RequestUtil.handleError(e);
        }
    }
    static handleError(error) {
        if (error.message === 'GraphQL error: unauthenticated') {
            Bus_1.default.$emit('logout');
        }
        else if (error.message === 'GraphQL error: unauthorized') {
            Bus_1.default.$emit('notify', 'error:unauthorized');
        }
        else if (error.message === 'GraphQL error: self_edit') {
            Bus_1.default.$emit('notify', 'error:self_edit');
        }
        else {
            Bus_1.default.$emit('notify', 'error:unknown');
        }
        throw error;
    }
    static async makeMutation($apollo, mutation, variables, context = {}) {
        try {
            const request = await $apollo.mutate({
                mutation,
                variables,
                context
            });
            return RequestUtil.handleRequestOutput(request);
        }
        catch (e) {
            return RequestUtil.handleError(e);
        }
    }
    static async makeUploadMutation($apollo, mutation, variables) {
        return this.makeMutation($apollo, mutation, variables, { hasUpload: true });
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