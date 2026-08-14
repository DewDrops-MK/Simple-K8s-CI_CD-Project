pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod

                metadata:
                    namespace: jenkins-agent
                spec:
                    containers:
                    - name: nodejs
                      image: node:alpine
                      imagePullPolicy: IfNotPresent
                      command:
                      - cat
                      tty: true'''
        }
    }
    environment {
    DOCKER_IMAGE = "dewdropsmk/Simple-K8s-CI_CD-Project"
    KUBECONFIG_CREDENTIALS = credentials('onprem-k8s-kubeconfig')
    SONARQUBE_TOKEN = credentials('sonarqube-token')
    }

    stages {
        stage('Code Checkout') {
            steps{
                container('nodejs') {
                    git branch: 'dev-implimention', url: 'https://github.com/DewDrops-MK/Simple-K8s-CI_CD-Project.git'
                    }  
                }
            }
        }
        stage('Run Unit Tests') {
            steps {
                container('nodejs') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }
        stage('Code Quality Analysis') {
            steps {
                container('nodejs') {
                    withSonarQubeEnv('sonarqube') {
                        sh """
                        sonar-scanner \
                        -Dsonar.projectKey=Simple-K8s-CI_CD-Project \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=https://sonarqube.learndevops.ovh/ \
                        -Dsonar.login=${SONARQUBE_TOKEN}
                        """
                }
            }
        }
    }
}