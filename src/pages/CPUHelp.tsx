import React from "react";
import { useTranslation } from "react-i18next";

function CPUHelp() {
	const { t } = useTranslation();

	return (
		<>
			<h2>Planificación de CPU</h2>
			<p>
				El simulador de planificación de procesador permite observar el funcionamiento de los distintos 
				algoritmos que se utilizan a la hora de poner en ejecución un proceso.
			</p>

			<h3>Algoritmos</h3>
			<h4>{t("cpu.algorithms.fifo")}</h4>
			<p>
				El algoritmo First In First Out (FIFO), también conocido como First Come First Served (FCFS) 
				o “primero en llegar, primero servirse”, es la política de planificación más simple. 
			</p>

			<p>
				Esta política planificación consiste en ejecutar los procesos en el mismo 
				orden que llegan a la cola de procesos listos.
			</p>

			<p>
				Así, si un proceso en ejecución queda bloqueado por E/S, cuando finalice la E/S, 
				será el último de la cola de procesos listos y por tanto, el último en ejecutarse.
			</p>

			<p>
				Este algoritmo facilita la ejecución de procesos de larga duración y favorece aquellos limitados por el procesador.
			</p>
			
			<h4>{t("cpu.algorithms.spn")}</h4>
			<p>
				El algoritmo Shortest Process Next (SPN) o “primero el más corto” es una política de planificación 
				que consiste en ejecutar el proceso que se espera que sea más corto.
			</p>

			<p>
				Algunos inconvenientes de esta política es la necesidad de poder estimar la duración del proceso 
				y la posible inanición de los procesos más largos que será menos prioritarios frente los procesos cortos.
			</p>

			<p>
				En el simulador, el valor de la estimación es el número de ciclos del proceso.
			</p>
			
			<h4>{t("cpu.algorithms.srtn")}</h4>
			<p>
				El algoritmo Shortest Remaining Time (SRT) es la versión apropiativa 
				del algoritmo SPN que consiste en ejecutar el proceso con un tiempo restante de ejecución menor.
			</p>

			<p>
				El tiempo restante de un proceso se puede calcular a partir del número de ciclos que ha sido ejecutado 
				y el tiempo de servicio, o en su defecto su estimación, del proceso.
			</p>

			<p>
				Este sistema de planificación puede producir inanición y favorece los procesos cortos frente a los procesos más largos.
			</p>
			
			<h4>{t("cpu.algorithms.hrrn")}</h4>
			<p>
				El algoritmo Highest Response Ratio Next (HRRN) o “primero el de mayor tasa de respuesta” es un algoritmo no apropiativo 
				que ejecuta el proceso con la mayor tasa de respuesta.
			</p>

			<p>
				Para cada uno de los procesos en la cola de listos se calcula su tasa de respuesta siguiendo la siguiente fórmula:
			</p>
			{/* FORMULA LATEX ratio = (tiempo esperando + tiempo de servicio) / tiempo de servicio*/}
			<p>Y se selecciona el proceso que maximice este resultado.</p>
			
			<p>
				En un principio favorece los procesos cortos, pero evita la inanición de los procesos largos porque se tiene en cuenta su tiempo de espera.
			</p>
			
			<h4>{t("cpu.algorithms.rr")}</h4>
			<p>
				El algoritmo Round Robin o turno rotatorio es un algoritmo apropiativo basado en un reloj. Los procesos reciben un tiempo limitado, conocido como quantum, 
				de procesador de manera rotatoria hasta que finalizan. Si los procesos han consumido el tiempo asignado y no han finalizado, 
				son expulsados y vuelven a situarse al final de la cola de procesos listos.
			</p>

			<p>
				Los principales inconvenientes de este sistema son fijar una rodaja de tiempo adecuada, el bajo rendimiento de los procesos limitados por E/S
				 y la sobrecarga que supone cambiar de proceso.
			</p>
			
			<h4>{t("cpu.algorithms.feedback")}</h4>
			<p>
				El algoritmo Feedback o retroalimentación es un sistema apropiativo que hace uso de un sistema 
				de colas de prioridad dinámica y un sistema de rodajas de tiempo. 
			</p>
			<p>
				Los procesos empiezan en la cola de máxima prioridad y cuando finaliza su rodaja de tiempo (y no han finalizado)
				 o quedan bloqueados por E/S pasan a la siguiente cola de menor prioridad. 
			</p>
			<p>
				Por ejemplo, es habitual que la rodaja de tiempo sea una potencia de 2 de la forma 2^i, 
				donde i es la prioridad de la cola (i=0 es la cola más prioritaria).
			</p>
			<p>
				Este sistema da preferencia a los procesos cortos y penaliza los procesos largos que han estado mucho tiempo en ejecución,
				 ya que se encuentran en colas de baja prioridad.
			</p>


			<h3>Funcionamiento</h3>
			<p>
				En la página del simulador se puede consultar el tutorial específico del simulador que realiza 
				una visita guiada a las distintas funcionalidades del simulador.
			</p>
			
			<h4>Procesos</h4>
			<p>
				Para empezar a utilizar el simulador es necesario introducir, como mínimo, un proceso. Para introducir un proceso se debe indicar:
				<ul>
					<li>El nombre del proceso, que debe ser único. Por defecto, se utilizará una letra disponible.</li>
					<li>El ciclo de llegada.</li>
					<li>
						La duración del proceso y la distribución de sus ciclos. <br/>
						Se puede especificar si el proceso estará bloqueado por E/S o utilizando el procesador en cada uno de los ciclos.
					</li>
				</ul>
			</p>

			<p>También se puede cargar uno de los ejemplos del simulador, que carga una lista de procesos predeterminada.</p>
			<p>
				Una vez introducidos los procesos, estos se pueden eliminar de la lista de procesos. 
				Para eliminarlos se debe presionar el botón situado al lado del nombre del proceso en la lista de procesos.
			</p>

			<h4>Vista simple y comparativa</h4>
			<p>
				Si se está usando la “Vista simple” del simulador se puede seleccionar un único algoritmo. 
				Los algoritmos que requieran configuración adicional mostrarán un panel al lado de la selección del algoritmo una vez seleccionados.
			</p>

			<p>
				En cambio, si se está usando la “Vista comparativa” se pueden seleccionar los distintos algoritmos al mismo tiempo. <br/>
				En este modo, es necesario crear configuraciones de aquellos algoritmos que lo requieran. Para hacerlo, primero se debe marcar el algoritmo 
				y presionar el botón “Añadir” que aparece bajo su nombre. A continuación, se mostrará el panel de configuración del algoritmo. 
				Para guardar la configuración se debe presionar el botón “Añadir configuración”.
			</p>

			<p>
				Una vez iniciada la simulación no se pueden realizar cambios en la lista de procesos o características de los algoritmos. 
				Para poder hacer cambios es necesario finalizar la simulación.
			</p>

			<h3>Resultados de la simulación</h3>
			
			<h4>Diagrama temporal</h4>
			<p>
				El diagrama temporal permite visualizar qué procesos se han ejecutado o han estado bloqueados por E/S en cada ciclo de la simulación.
				<div className="text-center"><img src="images/help/cpu_diagrama_temps.png"/></div>
				Los distintos procesos se ordenan a lo largo del eje vertical según el orden de introducción en el simulador. 
				El eje horizontal es el tiempo, expresado en ciclos de procesador.
			</p>

			<p>
				En función del estado del procesos en cada unos de los ciclos se representan de la siguiente manera:
				<ul>
					<li>Con un color sólido, el proceso se estaba ejecutando en ese instante</li>
					<li>Con un rectángulo rayado, el proceso estaba bloqueado por E/S en ese instante</li>
					<li>Sin rectángulo, el proceso no estaba en ejecución ni bloqueado</li>
				</ul>
			</p>

			<h4 id="cpu_summary">Tabla resumen</h4>
			<p>
				La tabla resumen de planificación muestra un resumen de cada uno de los procesos de la simulación. Para cada uno de ellos indica:

				<ul>
					<li>El ciclo de llegada del proceso.</li>
					<li>El ciclo de inicio del proceso, cuando ha empezado a recibir tiempo de procesador.</li>
					<li>El ciclo de finalización del proceso.</li>
					<li>El tiempo de respuesta, que es el tiempo entre la llegada de un proceso y su inicio.</li>
					<li>El tiempo de servicio (T<sub>s</sub>).</li>
					<li>El tiempo de retorno (T<sub>r</sub>), que es el tiempo de espera más el tiempo de ejecución.</li>
					<li>El tiempo de retardo normalizado calculado a partir de Tr / Ts.</li>
				</ul>

				De las columnas tiempo de retorno y tiempo de retorno normalizado se muestra la media de sus valores.
			</p>
		</>
	)
}

export default CPUHelp;