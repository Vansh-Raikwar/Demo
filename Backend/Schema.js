const joi = require("joi");

const listingSchema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().required().min(0),
    image: joi.object({
      filename: joi.string().allow("", null),
      url: joi.string().allow("", null)
    }),
    location: joi.string().required(),
    country: joi.string().required(),
    geometry: joi.object({
      type: joi.string().required(),
      coordinates: joi.array().required()
    }),
    reviews: joi.array().items(
      joi.object({
        type: joi.string().valid("Review"),
        ref: joi.string().valid("Review")
      })
    ),
    owner: joi.object({
      type: joi.string().valid("User "),
      ref: joi.string().valid("User ")
    })
  }).required()
});

const reviewSchema = joi.object({
  review: joi.object({
    rating: joi.number().required().min(1).max(5),
    message: joi.string().required(),
  }).required()
});

module.exports = { listingSchema, reviewSchema };