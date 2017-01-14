const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const globAll = require('glob-all');
const rimraf = require('rimraf');
const archiver = require('archiver');
const BbPromise = require('bluebird');

const pFsReadFile = BbPromise.promisify(fs.readFile);
const pRimraf = BbPromise.promisify(rimraf);

const CF_COGNITO_ZIP_FILENAME = 'cf-cognito-lambda.zip';
const CF_COGNITO_ZIP_S3_KEY = `cf-cognito-lambda/${CF_COGNITO_ZIP_FILENAME}`;

const CF_COGNITO_LAMBDA_NAME = 'ServerlessCfCognitoLambda';
const CF_COGNITO_LAMBDA_ROLE_NAME = `${CF_COGNITO_LAMBDA_NAME}Role`;
const CF_RESOURCE_LAMBDA_ROLE = {
  Type: 'AWS::IAM::Role',
  Properties: {
    AssumeRolePolicyDocument: {
      Version: '2012-10-17',
      Statement: {
        Effect: 'Allow',
        Principal: {
          Service: 'lambda.amazonaws.com',
        },
        'Action': 'sts:AssumeRole',
      },
    },
    'Path': '/',
    'Policies': [
      {
        'PolicyName': 'root',
        'PolicyDocument': {
          'Version': '2012-10-17',
          'Statement': [
            {
              'Effect': 'Allow',
              'Action': [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              'Resource': 'arn:aws:logs:*:*:*',
            },
            {
              'Effect': 'Allow',
              'Action': [
                'cognito-identity:CreateIdentityPool',
                'cognito-identity:DeleteIdentityPool',
                'cognito-identity:UpdateIdentityPool',
                'cognito-identity:SetIdentityPoolRoles',
              ],
              'Resource': '*',
            },
          ],
        },
      },
    ],
  },
};

const CF_RESOURCE_LAMBDA = {
  Type: 'AWS::Lambda::Function',
  Properties: {
    Code: {
      S3Bucket: {
        Ref: 'ServerlessDeploymentBucket',
      },
      S3Key: CF_COGNITO_ZIP_S3_KEY,
    },
    Handler: 'index.handler',
    MemorySize: 128,
    Role: {
      'Fn::GetAtt': [
        CF_COGNITO_LAMBDA_ROLE_NAME,
        'Arn',
      ],
    },
    Runtime: 'nodejs4.3',
    Timeout: 30,
  },
};

class CfCognitoPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');

    this.tempFolder = path.resolve('.cf-cognito');

    this.hooks = {
      'before:deploy:deploy': () => BbPromise.bind(this)
        .then(this.setBucketName)
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

  uploadCfLambda() {
    return BbPromise.bind(this)
        .then(this.checkCfLambda)
        .then((exists) => {
          if (exists) {
            return void 0;
          }

          this.serverless.cli.log('Uploading cognito handler lambda...');

          return BbPromise.bind(this)
            .then(this.zipCfLambda)
            .then(this.uploadCfLambdaToS3)
            .then(this.cleanupCfLambdaZip);
        });
  }

  checkCfLambda() {
    return BbPromise.bind(this)
      .then(() => this.getS3Metadata(CF_COGNITO_ZIP_S3_KEY))
      .then((metadata) => {
        return !!metadata;
      });
  }

  zipCfLambda() {
    const folderPath = path.join(__dirname, 'cf-cognito-lambda');
    const zipPath = path.join(this.tempFolder, CF_COGNITO_ZIP_FILENAME);
    return this.zipDirectory(folderPath, [], [], zipPath);
  }

  uploadCfLambdaToS3() {
    const filePath = path.join(this.tempFolder, CF_COGNITO_ZIP_FILENAME);
    return this.uploadZipFile(CF_COGNITO_ZIP_S3_KEY, filePath);
  }

  cleanupCfLambdaZip() {
    const filePath = path.join(this.tempFolder, CF_COGNITO_ZIP_FILENAME);
    return pRimraf(filePath);
  }

  addCfLambdaToResources() {
    const resources = this.getCfResources();

    if (resources[CF_COGNITO_LAMBDA_NAME] || resources[CF_COGNITO_LAMBDA_ROLE_NAME]) {
      throw new Error(`${CF_COGNITO_LAMBDA_NAME} and ${CF_COGNITO_LAMBDA_ROLE_NAME} are reserved resource names`);
    }

    resources[CF_COGNITO_LAMBDA_NAME] = CF_RESOURCE_LAMBDA;
    resources[CF_COGNITO_LAMBDA_ROLE_NAME] = CF_RESOURCE_LAMBDA_ROLE;

    return BbPromise.resolve();
  }

  updateResources() {
    const resources = this.getCfResources();

    /*
    Add
        "ServiceToken": {
					"Fn::GetAtt": [
						"${CF_COGNITO_LAMBDA_NAME}",
						"Arn"
					]
				},
    To
      "Type": "Custom::CognitoIdentityPool",

    */
  }

  getCfResources() {
    const compiledCloudFormationTemplate = _.get(this, 'serverless.service.provider.compiledCloudFormationTemplate');

    if (!compiledCloudFormationTemplate) {
      throw new Error('missing compiledCloudFormationTemplate');
    }

    compiledCloudFormationTemplate.Resources = compiledCloudFormationTemplate.Resources || {};

    return compiledCloudFormationTemplate.Resources;
  }

  getS3Metadata(key) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    return this.provider
      .request('S3',
        'headObject',
        params,
        this.options.stage,
        this.options.region)
      .catch((err) => {
        if (err.statusCode === 404) {
          return null;
        }
        throw err;
      });
  }

  uploadZipFile(key, filePath) {
    return pFsReadFile(filePath).then((body) => {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: 'application/zip',
      };

      return this.provider.request('S3',
        'putObject',
        params,
        this.options.stage,
        this.options.region
      );
    });
  }

  zipDirectory(folderPath, exclude, include, zipFilePath) {
    const patterns = ['**'];

    exclude.forEach((pattern) => {
      if (pattern.charAt(0) !== '!') {
        patterns.push(`!${pattern}`);
      } else {
        patterns.push(pattern.substring(1));
      }
    });

    // push the include globs to the end of the array
    // (files and folders will be re-added again even if they were excluded beforehand)
    include.forEach((pattern) => {
      patterns.push(pattern);
    });

    const zip = archiver.create('zip');

    this.serverless.utils.writeFileDir(zipFilePath);

    const output = fs.createWriteStream(zipFilePath);

    output.on('open', () => {
      zip.pipe(output);
      const files = globAll.sync(patterns, {
        cwd: folderPath,
        dot: true,
        silent: true,
        follow: true,
      });

      files.forEach((filePath) => {
        const fullPath = path.resolve(
          folderPath,
          filePath
        );

        const stats = fs.statSync(fullPath);

        if (!stats.isDirectory(fullPath)) {
          zip.append(fs.readFileSync(fullPath), {
            name: filePath,
            mode: stats.mode,
          });
        }
      });

      zip.finalize();
    });

    return new BbPromise((resolve, reject) => {
      output.on('close', () => resolve(zipFilePath));
      zip.on('error', (err) => reject(err));
    });
  }
}

module.exports = CfCognitoPlugin;
