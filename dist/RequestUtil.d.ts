export default class RequestUtil {
    static makeSubscription($apollo: any, query: any, variables: any, onUpdate: Function): any;
    static makeQuery($apollo: any, query: any, variables: any): Promise<any>;
    static makeMutation($apollo: any, mutation: any, variables: any): Promise<any>;
    static handleRequestOutput(request: any): any;
}
