"use strict";
import { success, failure, notAllowed } from "./../libs/response-lib";
import * as paypal from "paypal-rest-sdk";
import { fail } from "assert";

export async function webhook(event, context, callback) {
  console.log(paypal);
  paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
  });

  const items = [
    {
      id: "item1",
      description: "item1",
      info: {
        name: "item",
        sku: "item",
        price: "100.00",
        currency: "USD",
        quantity: 1
      },
      price: {
        currency: "USD",
        total: "100.00"
      }
    },
    {
      id: "item2",
      description: "item2",
      info: {
        name: "item",
        sku: "item",
        price: "1000.00",
        currency: "USD",
        quantity: 1
      },
      price: {
        currency: "USD",
        total: "1000.00"
      }
    }
  ];

  const { itemID } = event.pathParameters;
  const item = items.find(i => i.id == itemID);
  if (!items) {
    return callback(null, failure({ error: "Item no encontrado" }));
  }

  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: process.env.PAYPAL_SERVICE_RETURN_URL,
      cancel_url: process.env.PAYPAL_SERVICE_ERROR_URL
    },
    transactions: [
      {
        item_list: {
          items: [item.info]
        },
        amount: {
          ...item
        },
        description: "This is the payment description."
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      return callback(null, success(payment));
    }
  });
}

export async function onPaypalResult(event, context, callback) {
  console.log(event);
  try {
    const { successOrError } = event.pathParameters;
    const { paymentId, PayerID: payer_id } = event.queryStringParameters;

    if ("success" !== successOrError) {
      throw event;
    }
    const payment = await new Promise((resolve, reject) =>
      paypal.payment.execute(paymentId, { payer_id }, (error, payment) => {
        if (error) {
          reject(error);
        }
        resolve(payment);
      })
    );
  } catch (error) {
    console.log(error);
    return callback(null, failure(error));
  }
}

export async function onPaypalPurchaseSNS(event, context, callback) {
  console.log(event);
  return callback(null, success({ event }));
}
