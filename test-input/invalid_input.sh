#!/bin/sh
SCRIPT_PATH=${0%/*}
if [ "$0" != "${SCRIPT_PATH}" ] && [ "${SCRIPT_PATH}" != "" ]; then 
    cd ${SCRIPT_PATH}
fi
export JENKINS_HOME="`pwd`/application"
java -Dhudson.DNSMultiCast.disabled=true -Dhudson.model.DownloadService.never=true -Dhudson.model.UpdateCenter.never=true  -jar "${JENKINS_HOME}/ita.jar" $@
