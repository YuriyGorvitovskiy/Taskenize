pipeline {
    agent any
    stages {
        stage('Build') {
            try {
                echo 'Server Build'
                sh 'cd ./WebServer && npm update'
                sh 'cd ./WebServer && ./node_modules/.bin/tsc'
                sh 'cd ./WebServer && ./node_modules/.bin/tslint'
                echo 'Client Build'
                sh 'cd ./WebClient && npm update'
                sh 'cd ./WebClient && ./node_modules/.bin/tsc'
            } finally {
                echo '!!!BUILD FAILED!!!'
            }
        }
        stage('Create Docker Image') {
          steps {
            echo 'TODO: Define Create Docker Image Stage'
          }
        }
        stage('Test') {
          steps {
            echo 'TODO: Define Test Stage'
          }
        }
        stage('Publish Docker Image') {
            if (env.BRANCH_NAME == 'master') {
                echo 'TODO: Define Publish Docker Image Stage'
            }
        }
        stage('Deploy to AWS') {
            if (env.BRANCH_NAME == 'master') {
                echo 'TODO: Define Deploy to AWS Stage'
            }
        }
    }
}
