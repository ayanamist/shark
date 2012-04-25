# !/bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

export LANG=en_US.UTF-8

. /etc/init.d/functions

declare -r APPNAME=$(basename -- "${0}")
declare -r PIDFILE="##app.pid.file##"

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

# {{{ function start() #
start() {
    local pid=$(getpid)
    if [ ${pid} -gt 0 ] ; then
        echo "${APPNAME} is running (PID=${pid})"
    else
        :
    fi
}
# }}} #

# {{{ function stop() #
stop() {
    local pid=$(getpid)
    if [ ${pid} -gt 0 ] ; then
        echo "Stopping ${APPNAME} (PID=${pid}) ... "
        kill -s SIGTERM ${pid}
        for t in 1 1 2 2 ; do
            sleep ${t}
            if [ ! -d "/proc/${pid}" ] && [ $(ps --ppid ${id} | wc -l) -eq 0 ] ; then
                break
            fi
        done
        echo
    else
        echo "${APPNAME} is not running"
    fi
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
