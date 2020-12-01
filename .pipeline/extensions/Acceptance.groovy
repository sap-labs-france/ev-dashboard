import static com.sap.piper.internal.Prerequisites.checkScript

void call(Map params) {

  echo "do acceptance stage"
	echo "Cloning Helm chart repository.."
  checkout([
    $class: 'GitSCM',
    extensions: [
        [$class: 'RelativeTargetDirectory', relativeTargetDir: "deployment"],
    ],
    userRemoteConfigs: [
        [credentialsId: 'GitHub-emobility-ci-build', url: "https://github.wdf.sap.corp/EVSE/ev-scp-sap-it.git"]
    ]
  ])
  sh "ls"
  sh "ls deployment"
  //params.originalStage()

}
return this
