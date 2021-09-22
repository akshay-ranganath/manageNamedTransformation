# Named Transformation Updater

The purpose of this module is to build to helper script that can rename an existing named transformation and also delete the existing derivatives from Cloudinary.

![handyman tools](https://cdn.pixabay.com/photo/2015/07/11/14/53/plumbing-840835_1280.jpg)

## Background

On Cloudinary [named transformations](https://cloudinary.com/documentation/cloudinary_glossary#named_transformation) are created to provide a name to commonly used transformations. When a transformation is created using the name, this name becomes part of the derived asset that is created.

Sometimes, there may be a need to update the named transformation. When this occurs, the underlying transformations may not be deleted from Cloudinary back-end nor are the cached versions cleared from the CDN. 

This script is designed to help achieve automation for the 3 steps:

* Updating an existing named transformation
* Identifying derived images that exist for this named transformation.
* Deleting these derived images and clearing them Cloudinary CDN.

## Methodology

We will be using Cloudinary's [Admin API](https://cloudinary.com/documentation/admin_api) for handling this use case. Specifically, we will be using these 3 API calls:

* [Update Transformation](https://cloudinary.com/documentation/admin_api#update_transformation): Using this API, we will be changing the definition of an existing named transformation.
* [Get Transformation Details](https://cloudinary.com/documentation/admin_api#get_transformation_details): This API will return us with a list of derived images using this transformation. Note that the result itself can be paginated. To loop through, we will be using the [pagination](https://cloudinary.com/documentation/admin_api#pagination) mechanism. Each "page" will consist of 500 maximum resources.
* [Delete Derived Resources](https://cloudinary.com/documentation/admin_api#delete_derived_resources): Finally, we will be using the delete derived resource method to remove the images from both Cloudinary back-end and from the CDN cache. This API can take in a batch of 100 - so we will be using this batch size.

## Using the Script

### Script Installation

To use the script, please do the following.

First, install the dependencies.

`npm install` 

OR if you prefer yarn,

`yarn install`

### Setting Environment Variable

The next step is to set the [`CLOUDINARY_URL`](https://cloudinary.com/documentation/go_integration#setting_the_cloudinary_url_environment_variable) environment variable. To ensure the variable is set, just try this on the console. You should see the credentials for your account as the output.

```
echo $CLOUDINARY_URL
```
### Customizing the script

Next, edit the file `updateNamedTransformation.js`. All user changes needs to be made in the section between `BEGIN CUSTOMIZATION` and `END CUSTOMIZATION` towards the top of the script file. For example, in the code that is checked in, we are saying indicating that we want to update the named transformation named `auto-400-xform`. For this named transformation, we want the new definition to create images with a `width` and `height` of 600 pixels.

```javascript
/* ============================= BEGIN CUSTOMIZATION ============================================ */
// Step 0: Define the definition transformation
const transformationName = 'auto-400-xform'
const transformationDefinition = {
  width: 600,
  height: 600
}
/* ============================= END CUSTOMIZATION ============================================== */
```

### Executing the script

Finally, you can execute the script as follows:

```
node updateNamedTransformation.js
```

The script is built to be verbose by design. You should see the following kind of messages:

* Information messages in white.
* Success messages in green.
* Failure/Errors in red.

There is no special logging framework being used in this version of code.