pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Server Build'
        sh 'pwd'
        sh 'cd ./WebServer'
        sh 'pwd'
        sh 'ls'
        sh 'npm update'
        sh './node_modules/.bin/tsc'
        echo 'Client Build'
        sh 'cd ./WebClient'
        sh 'npm update'
        sh './node_modules/.bin/tsc'
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
      steps {
        echo 'TODO: Define Publish Docker Image Stage'
      }
    }
    stage('Deploy to AWS') {
      steps {
        echo 'TODO: Define Deploy to AWS Stage'
      }
    }
  }
}
