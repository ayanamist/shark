#!/bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

export LANG=en_US.UTF-8

declare -r __PWD__=$(pwd)
declare -r APPROOT=$(cd -- $(dirname -- ${0}) && cd .. && pwd)
declare -r _EXPIRE=##log.expire##

# {{{ function usage() #
usage() {
    echo "${0} log-directory"
}
# }}} #

if [ ${#} -lt 1 ] ; then
    declare -r LOGROOT="##log.root##"
else
    case "${1}" in
        -h|--help)
            usage
            exit 1
            ;;
        *)
            declare -r LOGROOT=$(readlink -f -- "${1}")
            ;;
    esac
fi

if [ ! -d "${LOGROOT}" ] ; then
    echo "LOG.ROOT (${LOGROOT}) not found."
    exit 2
fi

declare -r LOGDATE=$(date -d"-1day" +"%Y%m%d")
if [ ! -d "${LOGROOT}/${LOGDATE}" ] ; then
    mkdir -p "${LOGROOT}/${LOGDATE}"
fi

if [ ! -d "${LOGROOT}/${LOGDATE}" ] ; then
    exit 3
fi

if [ ${_EXPIRE} -gt 0 ] ; then
    find "${LOGROOT}" -ctime +${_EXPIRE} | xargs rm -rf
fi

for _file in $(find -- "${LOGROOT}" -maxdepth 1 -type f -name "*.log") ; do
    mv -f "${_file}" "${LOGROOT}/${LOGDATE}/"
done

cd "${APPROOT}" && ./bin/##app.name## reload && cd "${LOGROOT}/${LOGDATE}"
if [ ${?} -ne 0 ] ; then
    exit 4
fi

for _file in $(find . -type f | grep -v -E "\.tar\.gz$") ; do
    if [ $(file -- "${_file}" | grep -c -w "gzip") -gt 0 ] ; then
        continue
    fi
    tar cvzf "${_file}.${LOGDATE}.tar.gz" ${_file} && rm -f ${_file}
done

cd "${__PWD__}"
exit 0
