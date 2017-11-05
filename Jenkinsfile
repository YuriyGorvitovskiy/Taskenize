pipeline {
    agent any
    options {
        skipStagesAfterUnstable()
    }
    stages {
        stage('Build Server') {
            steps {
                sh 'cd ./WebServer && npm update'
                sh 'cd ./WebServer && ./node_modules/.bin/tsc'
                sh 'cd ./WebServer && ./node_modules/.bin/tslint ts/**/*.ts ts/*.ts'
                sh 'cd ./WebServer && ./node_modules/.bin/mocha -r ts-node/register ts/test/**/*.ts  ts/*.ts'
                sh 'cd ./WebServer && ./node_modules/.bin/istanbul cover --include-all-sources --root ./bin/ ./node_modules/mocha/bin/_mocha bin/test/**/*.js bin/test/*.js && ./node_modules/.bin/istanbul check-coverage --functions 47'
                sh 'cd ./WebServer && ./node_modules/.bin/snyk test'
                sh 'cd ./WebServer && ./node_modules/.bin/nsp check'
            }
        }
        stage('Build Client') {
            steps {
                sh 'cd ./WebClient && npm update'
                sh 'cd ./WebClient && ./node_modules/.bin/tsc'
                sh 'cd ./WebServer && ./node_modules/.bin/tslint ts/**/*.{ts,tsx} ts/*.{ts,tsx}'
                sh 'cd ./WebClient && ./node_modules/.bin/snyk test'
                sh 'cd ./WebClient && ./node_modules/.bin/nsp check'
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
            when {
                branch 'master'
            }
            steps {
                echo 'TODO: Define Publish Docker Image Stage'
            }
        }
        stage('Deploy to AWS') {
            when {
                branch 'master'
            }
            steps {
                echo 'TODO: Define Deploy to AWS Stage'
            }
        }
    }
}
