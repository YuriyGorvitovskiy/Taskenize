pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        git(url: 'https://github.com/YuriyGorvitovskiy/Taskenize', changelog: true, poll: true, branch: 'master')
      }
    }
    stage('Build') {
      steps {
        echo 'echo \'TODO: Define Build Stage\''
        sh '''cd ./WebServer
pwd
ls -al
npm update'''
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