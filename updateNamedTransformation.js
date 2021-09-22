const cloudinary = require('cloudinary')
const colors = require('colors')

/**
 * Helper function to update the Cloudinary transformation. It always does an unsafe_update.
 * This method cannot be used to create a new transformation.
 *
 * @param {String} transformationName
 * @param {Object} transformationDefinition
 * @returns {Object}
 */
async function updateTransformation (transformationName, transformationDefinition) {
  return cloudinary.v2.api.update_transformation(
    transformationName,
    {
      unsafe_update: transformationDefinition
    }
  )
}

/**
 *
 * @param {String} transformationName
 * @returns {Object}
 */
async function getTransformationDefinition (transformationName) {
  return cloudinary.v2.api.transformation(transformationName)
}

/**
 *
 * @param {Object} transformation
 * @param {String} nextCursor
 * @returns
 */
async function findDerivatives (transformation, nextCursor = null) {
  let counter = 0
  const resourceIds = Array()

  let response = null

  do {
    response = await cloudinary.v2.api.transformation(
      transformation, {
        max_results: 500,
        next_cursor: response ? response.next_cursor : null
      }
    )
    const derived = response.derived
    counter += derived.length
    for (let i = 0; i < derived.length; i++) {
      resourceIds.push(derived[i].id)
    }
  } while (response.next_cursor)

  return {
    count: counter,
    resources: resourceIds
  }
}

/**
 *
 * @param {Number} count
 * @param {Array} resources
 */
async function deleteDerivatives (count, resources) {
  const slices = Math.ceil(count / 100)

  for (let slice = 0; slice < slices; slice++) {
    await cloudinary.v2.api.delete_derived_resources(
      resources.slice(slice * 100, (slice + 1) * 100),
      { invalidate: true }
    )
  }
}

/**
 *
 */
async function main () {
  try {
    // Step 1.a.: Update Transformation
    let result = await updateTransformation(transformationName, transformationDefinition)
    if (result.message === 'updated') {
      console.log('Transformation updated successfully.\n'.green)
      console.log('Here is the new definition of the transformation:'.white)

      // Step 1.b.: Validate update is successful
      const newDefinition = await getTransformationDefinition(transformationName)
      delete newDefinition.derived
      console.log(JSON.stringify(newDefinition, null, ' '))
      console.log('\nNow fetching and deleting derived resources.'.white)

      // Step 2: Find existing transformations
      result = await findDerivatives(transformationName)

      // Step 3: Invalidate and delete the resources
      if (result.count > 0) {
        console.log(`Found a total of ${result.count} assets using the named transformation`.green)
        console.log('Invalidating resources now..'.white)
        result = await deleteDerivatives(result.count, result.resources)
        console.log('Completed deletion and invalidation of resources.'.green)
      } else {
        console.log('No derivates found. Nothing to delete or invalidate.'.green)
      }
    } else {
      console.log(result)
    }
  } catch (err) {
    if (err === 'Must supply cloud_name') {
      console.error('Initialization failed! You need to set the CLOUDINARY_URL environment variable.'.red)
    } else {
      if (err.error) {
        console.error(`${err.error.http_code}: ${err.error.message}`.red)
      } else {
        console.error(`${err}`.red)
      }
    }
  }
}

// Step 0: Define the definition transformation
const transformationName = 'auto-400-xform'
const transformationDefinition = {
  width: 600,
  height: 600
}

main()
