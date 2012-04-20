# !/bin/bash
# vim: set expandtab tabstop=4 shiftwidth=4 foldmethod=marker: #

export LANG=en_US.UTF-8

. /etc/init.d/functions

declare -i PID=0
if [ -f "##app.pid.file##" ] ; then
    PID=`cat "##app.pid.file##"`
fi

# {{{ function usage() #
function usage() {
    echo "${0} {start|stop|restart|status}"
    exit 1;
}
# }}} #

# {{{ function start() #
function start() {
:
}
# }}} #

# {{{ function stop() #
function stop() {
if [ ${PID} -gt 0 ] ; then
    kill -s SIGTERM ${PID}
fi
}
# }}} #

# {{{ function restart() #
function restart() {
if [ ${PID} -gt 0 ] ; then
    kill -s SIGUSR1 ${PID}
fi
}
# }}} #

case "${1}" in
    start)
        start;;  
    stop)
        stop;;
    restart)
        restart;;
    *)
        usage;;
esac
