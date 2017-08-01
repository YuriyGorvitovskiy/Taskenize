pipeline {
    agent any
    options {
        skipStagesAfterUnstable()
    }
    stages {
        stage('Build') {
            steps {
                echo 'Server Build'
                sh 'cd ./WebServer && npm update'
                sh 'cd ./WebServer && ./node_modules/.bin/tsc'
                echo 'Client Build'
                sh 'cd ./WebClient && npm update'
                sh 'cd ./WebClient && ./node_modules/.bin/tsc'
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
