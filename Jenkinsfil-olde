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
      tty: true

    - name: sonar
      image: eclipse-temurin:17-jdk
      imagePullPolicy: IfNotPresent
      command:
        - cat
      tty: true

    - name: kaniko
      image: gcr.io/kaniko-project/executor:v1.23.2-debug
      command:
      - /busybox/cat
      tty: true

      volumeMounts:
        - name: docker-sock
          mountPath: /var/run/docker.sock

  volumes:

    - name: docker-sock
      hostPath:
        path: /var/run/docker.sock
        type: Socket
'''
        }
    }

    environment {

        DOCKER_IMAGE = "dewdropsmk/Simple-K8s-CI_CD-Project-devImplimention"

        DOCKER_TAG = "${BUILD_NUMBER}"

        KUBECONFIG_CREDENTIALS = credentials('onprem-k8s-kubeconfig')

        SONARQUBE_TOKEN = credentials('sonarqube-token')
    }

    stages {

        stage('Code Checkout') {

            steps {

                container('nodejs') {

                    git(
                        branch: 'dev-implimention',
                        url: 'https://github.com/DewDrops-MK/Simple-K8s-CI_CD-Project.git'
                    )
                }
            }
        }


        stage('Run Unit Tests') {

            steps {

                container('nodejs') {

                    sh '''
                        echo "===== Node.js ====="
                        node --version

                        echo "===== NPM ====="
                        npm --version

                        echo "===== Installing Dependencies ====="
                        npm ci

                        echo "===== Running Unit Tests ====="
                        npm test -- --exit
                    '''
                }
            }
        }


        stage('Code Quality Analysis') {

            steps {

                container('sonar') {

                    script {

                        def scannerHome = tool 'SonarQube-Scanner'

                        withSonarQubeEnv('sonarqube') {

                            sh """
                                echo "===== Java ====="
                                java -version

                                echo "===== SonarQube Scanner ====="
                                ${scannerHome}/bin/sonar-scanner --version

                                echo "===== Running SonarQube Analysis ====="

                                ${scannerHome}/bin/sonar-scanner \
                                  -Dsonar.projectKey=Simple-K8s-CI_CD-Project \
                                  -Dsonar.sources=.
                            """
                        }
                    }
                }
            }
        }


        stage('Docker Build') {

            steps {

                container('docker') {

                    sh '''
                        echo "===== Docker Version ====="
                        docker --version

                        echo "===== Docker Info ====="
                        docker info

                        echo "===== Building Docker Image ====="

                        docker build \
                          -t ${DOCKER_IMAGE}:${DOCKER_TAG} \
                          .

                        echo "===== Docker Images ====="

                        docker images ${DOCKER_IMAGE}
                    '''
                }
            }
        }


        stage('Docker Image Scan') {

            steps {

                container('docker') {

                    sh '''
                        echo "===== Docker Image ====="

                        docker images ${DOCKER_IMAGE}:${DOCKER_TAG}

                        echo "Trivy scan will run here"
                    '''
                }
            }
        }


        stage('Docker Push') {

            steps {

                container('docker') {

                    sh '''
                        echo "===== Docker Push ====="

                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                    '''
                }
            }
        }
    }


    post {

        success {

            echo """
            ==========================================
            BUILD SUCCESSFUL
            ==========================================

            Image:
            ${DOCKER_IMAGE}:${DOCKER_TAG}

            Build:
            ${BUILD_NUMBER}

            ==========================================
            """
        }

        failure {

            echo """
            ==========================================
            BUILD FAILED
            ==========================================
            """
        }

        always {

            echo "Pipeline completed."
        }
    }
}