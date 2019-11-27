pipeline {
   agent any

   stages {
      stage('Clone Git') {
         steps {
            git 'https://github.com/denikov/job-finder-chrome-extension'
         }
      }
      
      stage('Install Dependencies') {
         steps {
            sh 'npm install'
         } 
      }
      
      stage('Test') {
          steps {
              sh 'npm test'
          }
      }
   }
}
