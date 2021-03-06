#!/bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

export LANG=en_US.UTF-8

. /etc/init.d/functions

declare -r __PWD__=$(pwd)
declare -r APPROOT=$(cd -- $(dirname -- ${0}) && cd .. && pwd)
declare -r APPNAME="##app.name##"

declare -r PIDFILE="##pid.file##"
declare -r LOGROOT="##log.root##"
declare -r FSTATUS="##200.file##"
declare -r NODEBIN="##node.bin##"

# {{{ function usage() #
usage() {
    echo "${0} {start [properties file]|stop|reload|restart|status}"
    exit 1;
}
# }}} #

declare -r __ACTION="${1}"
declare __PROPERTIES="##properties##"
if [ ${#} -gt 1 ] ; then
    __PROPERTIES=$(readlink -f -- "${2}")
fi

# {{{ function getpid() #
getpid() {
    local pid=$(cat -- "${PIDFILE}" 2> /dev/null)
    if [ -z "${pid}" ] || [ ! -d "/proc/${pid}" ] ; then
        pid=0
    fi
    echo ${pid}
}
# }}} #

# {{{ function still() #
still() {
    local pid="${1}"
    if [ -d "/proc/${pid}" ] ; then
        return 1
    fi

    if [ $(ps --ppid ${pid} | grep -v -w -c "PID") -gt 0 ] ; then
        return 1
    fi

    return 0
}
# }}} #

# {{{ function start() #
start() {
    local pid=$(getpid)

    if [ ${pid} -gt 0 ] ; then
        echo "${APPNAME} is already running (PID=${pid})"
        return
    fi

    if [ ! -f "${__PROPERTIES}" ] ; then
        echo "Properties file (${__PROPERTIES}) not found."
        exit 2
    fi

    for dir in $(dirname -- "${PIDFILE}") $(dirname -- "${FSTATUS}") ${LOGROOT} ; do
        /bin/mkdir -p ${dir}
    done

    echo -n "start ${APPNAME} ... "
    ulimit -c unlimited
    ${NODEBIN} ${APPROOT}/dispatch.js ${__PROPERTIES} >> "${LOGROOT}/##app.name##.stdout" 2>&1 &
    for _time in 1 1 2 3 3 ; do
        sleep ${_time}

        pid=$(getpid)
        if [ ${pid} -gt 0 ] ; then
            echo -n ", PID=${pid}"
            if [ ! -z "${FSTATUS}" ] ; then
                sleep 1 && touch "${FSTATUS}"
            fi
            echo_success
            echo
            return
        fi
    done
    echo_failure
    echo
}
# }}} #

# {{{ function stop() #
stop() {
    local pid=$(getpid)
    if [ ${pid} -eq 0 ] ; then
        echo "${APPNAME} is not running"
        return
    fi

    echo -n "stop ${APPNAME} (PID=${pid})"
    if [ -f "${FSTATUS}" ] ; then
        echo -n ", please wait for 6s ... "
        /bin/rm -f "${FSTATUS}" &> /dev/null
        sleep 6
    fi

    kill -15 ${pid}
    for t in 1 1 2 3 3 ; do
        sleep ${t}
        still ${pid}
        if [ ${?} -eq 0 ] ; then
            break
        fi
    done

    still ${pid}
    if [ ${?} -gt 0 ] ; then
        echo -n ", force kill ... "
        kill -9 ${pid} &> /dev/null
        for i in $(ps --ppid ${pid} | grep -v -w "PID" | awk '{print $1}') ; do
            kill -9 ${i} &> /dev/null
        done
    fi

    if [[ -f "${PIDFILE}" ]] && [[ ${pid}=`cat ${PIDFILE} 2>/dev/null` ]] ; then
        /bin/rm -f "${PIDFILE}" &> /dev/null
    fi

    echo_success
    echo
}
# }}} #

# {{{ function reload() #
reload() {
    local pid=$(getpid)
    if [ ${pid} -eq 0 ] ; then
        echo "${APPNAME} is not running"
        return
    fi

    local sub=$(ps --ppid ${pid} | grep -v -w "PID" | awk '{print $1}')
    echo -n "Reload ${APPNAME} (PID=${pid}) ... "
    kill -10 ${pid}
    for _time in 1 1 2 3 3 ; do
        local has=0
        for _pid in ${sub} ; do
            if [ -d "/proc/${_pid}" ] ; then
                has=1
            fi
        done

        if [ ${has} -eq 0 ] ; then
            echo_success
            echo
            return
        fi
        sleep ${_time}
    done

    stop
    start
}
# }}} #

# {{{ function status() #
status() {
    local pid=$(getpid)
    if [ "${pid}" -gt 0 ] ; then
        echo "${APPNAME} is running (PID=${pid})"
    else
        echo "${APPNAME} is not running"
    fi
}
# }}} #

cd ${__PWD__}
case "${__ACTION}" in
    start)
        start;;  
    stop)
        stop;;
    restart)
        stop
        start;;
    reload)
        reload;;
    status)
        status;;
    *)
        usage;;
esac
