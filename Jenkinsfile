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
    stages {
        stage('Agent Info'){
            steps{
                container('Code checkout'){
                    git branch: 'dev-implimention', url: 'https://github.com/DewDrops-MK/Simple-K8s-CI_CD-Project.git'
                    }  
                }
            }
        }
    }