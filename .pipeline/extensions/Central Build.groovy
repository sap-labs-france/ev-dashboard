import static com.sap.piper.internal.Prerequisites.checkScript

void call(Map params) {

	params.originalStage()
  sh "ls"

}
return this
