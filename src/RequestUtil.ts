import _ from 'lodash'
import Bus from './Bus'

export default class RequestUtil {
  static makeSubscription($apollo:any, query:any, variables:any, onUpdate:Function) {
    const store = JSON.parse(window.localStorage.getItem('mm'))

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
        return RequestUtil.handleError(error)
        }
      })
    } catch (e) {
      return RequestUtil.handleError(e)
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
      return RequestUtil.handleError(e)
    }
  }

  static handleError (error:Error) {
    if (error.message === 'GraphQL error: unauthenticated') {
      Bus.$emit('logout')
    } else if (error.message === 'GraphQL error: unauthorized') {
      Bus.$emit('notify', 'error:unauthorized')
    } else if (error.message === 'GraphQL error: self_edit') {
      Bus.$emit('notify', 'error:self_edit')
    } else {
      Bus.$emit('notify', 'error:unknown')
    }

    throw error
  }

  static async makeMutation($apollo:any, mutation:any, variables:any, context:any = {}) {
    try {
      const request = await $apollo.mutate({
        mutation,
        variables,
        context
      });

      return RequestUtil.handleRequestOutput(request)
    } catch (e) {
      return RequestUtil.handleError(e)
    }
  }

  static async makeUploadMutation($apollo:any, mutation:any, variables:any) {
    return this.makeMutation($apollo, mutation, variables, { hasUpload: true })
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
