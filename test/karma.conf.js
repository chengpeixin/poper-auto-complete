// 新建 karma.conf.js，内容如下
module.exports = function (config) {
    config.set({

           frameworks: ['mocha','sinon-chai','karma-typescript'],
           client: {
               chai: {
                   includeStack: true
               }
           },
           files: [
               './unit/**/*.spec.ts'
           ],
           exclude: [],
           preprocessors: {
               './unit/**/*.spec.ts':['babel'],
               "**/*.ts": "karma-typescript"
           },
           typescriptPreprocessor:{
            options:{
                sourceMap: false,
                target: 'ES5',
                module: 'amd',
                noImplicitAny: true,
                noResolve: true,
                removeComments: true,
                concatenateOutput: false
            },
            transformPath: function(path) {
                return path.replace(/\.ts$/, '.js');
              }
           },


           // test results reporter to use
           // possible values: 'dots', 'progress'
           // available reporters: https://npmjs.org/browse/keyword/karma-reporter
           reporters: ['progress'],


           // web server port
           port: 9876,


           // enable / disable colors in the output (reporters and logs)
           colors: true,


           // level of logging
           // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
           logLevel: config.LOG_INFO,
           autoWatch: true,
           browsers: ['ChromeHeadless'],
           singleRun: false,
           concurrency: Infinity
       })
   }