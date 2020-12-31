const basejoi=require('joi');
const sanitizeHtml = require('sanitize-html');

const extension=(joi)=>({
    type: 'string',
    base: joi.string(),
    messages: {
      'string.escapeHTML': '{{#label}}must not contain any html tags.',
    },
    rules: {
      escapeHTML: {
        validate(value, helpers) {
          const clean = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
          });
          if (clean!==value)return helpers.error('string.escapeHTML',{value}) 
            return clean;
          }
          // return this.createError('string.htmlStrip', { value }, state, options);
        }
      }
    
  
});
const joi=basejoi.extend(extension);
const campgroundSchema = joi.object({
    campground: joi.object({
        title: joi.string().required().escapeHTML(),
      price: joi.number().required().min(0),
        location: joi.string().required().escapeHTML(),
        // image: joi.string().required(),
        description: joi.string().required().escapeHTML(),
}).required(),
deleteImages:joi.array()
})
module.exports.campgroundSchema=campgroundSchema;

const reviewSchema=joi.object({
  review:joi.object({
    rating:joi.number().required().min(1).max(5) ,
    body:joi.string().required().escapeHTML(),
  }).required()
})
module.exports.reviewSchema=reviewSchema;
