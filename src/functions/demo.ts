'use strict';
import { success, failure, notAllowed } from './../libs/response-lib';

export async function demo(event, context, callback) {
    console.log('hola')
    return callback(null,success('success'))
}
