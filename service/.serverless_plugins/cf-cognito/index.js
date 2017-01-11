'use strict';

const BbPromise = require('bluebird');

class CfCognitoPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');
  
    this.hooks = {
      'before:deploy:deploy': () => BbPromise.bind(this)
        .then(this.setBucketName)
        .then(this.checkCfLambda)
        .then(this.uploadCfLambda)
        .then(this.addCfLambdaToResources)
        .then(this.updateResources),
    };
  }

  setBucketName() {
    if (this.bucketName) {
      return BbPromise.resolve(this.bucketName);
    }

    if (this.options.noDeploy) {
      return BbPromise.resolve();
    }

    return this.provider.getServerlessDeploymentBucketName(this.options.stage, this.options.region)
      .then((bucketName) => {
        this.bucketName = bucketName;
      });
  }

  checkCfLambda() {
    // check S3 for /cf-cognito-lambda.zip
    return BbPromise.resolve(true);
  }

  uploadCfLambda(exists) {
    if (exists) {
      return BbPromise.resolve();
    }
    // upload to S3

    // https://github.com/binoculars/aws-cloudformation-cognito-identity-pool

/* // upload artifact
    const body = fs.readFileSync(artifactFilePath);

    const fileName = artifactFilePath.split(path.sep).pop();

    const params = {
      Bucket: this.bucketName,
      Key: `/cf-cognito-lambda.zip`,
      Body: body,
      ContentType: 'application/zip',
    };

    return this.provider.request('S3',
      'putObject',
      params,
      this.options.stage,
      this.options.region);
 */

    return BbPromise.resolve();
  }

  addCfLambdaToResources() {
    const resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
    // add cognito lambda stuff without duplicate
    // ServerlessCfCognitoLambda

    return BbPromise.resolve();
  }

  updateResources() {
    /*
    Add
        "ServiceToken": {
					"Fn::GetAtt": [
						"ServerlessCfCognitoLambda",
						"Arn"
					]
				},
    To
      "Type": "Custom::CognitoIdentityPool",

    */
  }
}

module.exports = CfCognitoPlugin;