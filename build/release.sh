# ! /bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

export LANG=en_US.UTF-8

declare -r __PATH="$(pwd)"
declare -r __ROOT="$(dirname -- $(cd -- $(dirname -- ${0}) && pwd))"
declare -r __GITURL="$(grep url ${__ROOT}/.git/config | grep @github.com: | head -n1 | cut -d= -f2)"
declare -r __NAME="$(basename -- ${__GITURL} | cut -d. -f1)"

if [ -d "${__ROOT}/build/src" ] ; then
    /bin/rm -rf "${__ROOT}/build/src"
fi

if [ -d "${__ROOT}/build/output" ] ; then
    /bin/rm -rf "${__ROOT}/build/output"
fi

mkdir -p "${__ROOT}/build/src" && mkdir -p "${__ROOT}/build/output" && \
    git clone ${__GITURL} ${__ROOT}/build/src && \
    cd "${__ROOT}/build/src" && \
    find . -name ".*" | grep -E "[^\.\w\+]" | xargs rm -rf && \
    /bin/rm -rf ./test ./build/tpl/test && \
    find ./build -depth 1 -name "*.sh" | grep -v "makeconf.js" | xargs rm -rf && \
    tar -cvzf ../output/${__NAME}.tar.gz ./* && /bin/rm -rf "${__ROOT}/build/src"

cd ${__PATH}
