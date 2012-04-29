#!/bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

export LANG=en_US.UTF-8

declare -r __PWD__=$(pwd)
declare -r APPROOT=$(cd -- $(dirname -- ${0}) && cd .. && pwd)

declare -r LOGROOT="##log.root##"
declare -r LOGDATE=$(date -d"-1day" +"%Y%m%d")

if [ ! -d "${LOGROOT}" ] ; then
    echo "LOG.ROOT (${LOGROOT}) not found."
    exit 1
fi

if [ ! -d "${LOGROOT}/${LOGDATE}" ] ; then
    mkdir -p "${LOGROOT}/${LOGDATE}"
fi

for _file in $(find -- "${LOGROOT}" -type f) ; do
    echo ${_file}
    if [ 0 ] ; then
        continue;
    fi
    mv -f "${_file}" "${LOGROOT}/${LOGDATE}/"
done

cd "${APPROOT}" && ./bin/appctl reload

cd "${LOGROOT}/${LOGDATE}"
if [ ${?} -ne 0 ] ; then
    exit 2
fi

for _file in $(find . -type f) ; do
    tar cvzf "${_file}.${LOGDATE}.tar.gz" ${_file} && rm -f ${_file}
done

cd "${__PWD__}"

