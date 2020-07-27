export default class RequestUtil {
    static makeSubscription($apollo: any, query: any, variables: any, onUpdate: Function): any;
    static makeQuery($apollo: any, query: any, variables: any): Promise<any>;
    static handleError(error: Error): void;
    static makeMutation($apollo: any, mutation: any, variables: any, context?: any): Promise<any>;
    static makeUploadMutation($apollo: any, mutation: any, variables: any): Promise<any>;
    static handleRequestOutput(request: any): any;
}
