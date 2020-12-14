import static com.sap.piper.internal.Prerequisites.checkScript

void call(Map params) {

	echo "do acceptance stage for now"
	downloadArtifactsFromNexus script: this, fromStaging: true
	sh "ls"
	//deleteDir()
	//sh "ls"
	//echo "checkout dashboard source"
	//checkout scm
	//sh "ls"
	//echo "Cloning deployment config repository.."
	//checkout([
	//	$class: 'GitSCM',
	//	extensions: [
	//		[$class: 'RelativeTargetDirectory', relativeTargetDir: "deployment"],
	//	],
	//	userRemoteConfigs: [
	//		[credentialsId: 'GitHub-emobility-ci-build', url: "https://github.wdf.sap.corp/EVSE/ev-scp-sap-it.git"]
	//	]
	//	])
	//sh "ls"
	//sh "ls deployment"
	//sh "cp -pr ./deployment/e-Mobility-dev/sap-ev-front-end-server/* ."
	//sh "ls"
	//sh "pwd"
	//sh "find . -name 'manifest*'"
	//sh "find . -name 'config.json'"
	//sh "ls src/assets"

	//params.originalStage()

}
return this
