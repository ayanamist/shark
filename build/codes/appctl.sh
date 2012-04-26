# !/bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

export LANG=en_US.UTF-8

. /etc/init.d/functions

declare -r __PWD__=$(pwd)
declare -r APPROOT=$(cd -- $(dirname -- ${0}) && cd .. && pwd)
declare -r APPNAME=$(basename "${0}")

declare -r PIDFILE="##app.pid.file##"
declare -r NODEBIN="##nodejs.bin##"

# {{{ function usage() #
usage() {
    echo "${0} {start|stop|reload|restart|status}"
    exit 1;
}
# }}} #

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

    echo "Start ${APPNAME} ... "
    nohup ${NODEBIN} ${APPROOT}/bin/_shark &
    for _time in 1 1 1 1 2 ; do
        pid=$(getpid)
        if [ ${pid} -gt 0 ] ; then
            echo_success
            return
        fi

        sleep ${_time}
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

    echo "Stopping ${APPNAME} (PID=${pid}) ... "
    kill -s SIGTERM ${pid}
    for t in 1 1 1 1 1 ; do
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

    echo_success
    echo
}
# }}} #

# {{{ function reload() #
reload() {
    local pid=$(getpid)
    if [ ${pid} -gt 0 ] ; then
        echo "Reload ${APPNAME} (PID=${pid}) ... "
        kill -s SIGUSR1 ${pid}
        if [ ${?} -eq 0 ] ; then
            echo_success
        else
            echo_failure
        fi
        echo
    else
        echo "${APPNAME} is not running"
    fi
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
case "${1}" in
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
