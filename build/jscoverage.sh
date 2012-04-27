# ! /bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

declare -r __PATH=`pwd`
declare -r __ROOT="$(cd -- $(dirname -- ${0}) && pwd)"
declare -r JSCOVE="${__ROOT}/jscoverage"

# {{{ function install_jscoverage() #
install_jscoverage() {
    if [ ! -d "${__ROOT}/tmp" ] ; then
        mkdir -p "${__ROOT}/tmp"
    fi

    cd "${__ROOT}/tmp" && git clone git://github.com/visionmedia/node-jscoverage.git node-jscoverage && \
        cd node-jscoverage && ./configure && make && \
        cp ./jscoverage "${JSCOVE}" && chmod +x "${JSCOVE}" && /bin/rm -rf ${__ROOT}/tmp
}
# }}} #

if [ ! -f "${JSCOVE}" ] ; then
    install_jscoverage
fi

cd "${__PATH}"
