import _ from 'lodash'

export default class RequestUtil {
  static makeSubscription($apollo:any, query:any, variables:any, onUpdate:Function) {
    const store = JSON.parse(window.localStorage.getItem(process.env.KEY))

    try {
      const request = $apollo.subscribe({
        query,
        variables: {
          token: _.get(store, 'auth.token'),
          ...variables
        },
        updateQuery (prev:any, res:any) {
          console.log('ok', prev, res.subscriptionData)
        }
      });

      return request.subscribe({
        next (data:any) {
          onUpdate(data.data)
        },
      error (error:any) {
          throw error
        }
      })
    } catch (e) {
      throw e
    }
  }

  static async makeQuery($apollo:any, query:any, variables:any) {
    try {
      const request = await $apollo.query({
        query,
        variables,
      });

      return RequestUtil.handleRequestOutput(request)
    } catch (e) {
      throw e
    }
  }

  static async makeMutation($apollo:any, mutation:any, variables:any) {
    try {
      const request = await $apollo.mutate({
        mutation,
        variables,
      });

      return RequestUtil.handleRequestOutput(request)
    } catch (e) {
      throw e
    }
  }

  static handleRequestOutput (request:any) {
    const errors = _.get(request, 'errors', [])

    if (errors.length && _.get(errors, '0.message') === 'GraphQL error: You do not have permission to perform this action') {
      throw new Error('Not authorized')
    }

    const data = _.get(request, 'data')

    if (Object.values(data).length === 1) {
      return _.first(Object.values(data))
    }

    return data
  }
};
