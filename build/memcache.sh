# ! /bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

declare -r __PATH=`pwd`
declare -r __ROOT="$(cd -- $(dirname -- ${0}) && pwd)"
declare -r MEMCACHE="${__ROOT}/memcached"

install_memcached() {
    if [ ! -d "${__ROOT}/tmp" ] ; then
        mkdir -p "${__ROOT}/tmp"
    fi
    cd "${__ROOT}/tmp" && wget "http://memcached.googlecode.com/files/memcached-1.4.13.tar.gz" && \
        tar zxvf ./memcached-1.4.13.tar.gz && cd memcached-1.4.13 && ./configure && make && \
        cp ./memcached "${MEMCACHE}" && chmod +x "${MEMCACHE}" && /bin/rm -rf ${__ROOT}/tmp
}

if [ ! -f "${MEMCACHE}" ] ; then
    install_memcached
fi

${MEMCACHE} -d -p11211

cd "${__PATH}"
