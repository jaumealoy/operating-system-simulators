import React from "react";
import { useTranslation } from "react-i18next";
import Latex from "./../components/Latex";

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
			<p>{t("help.modals.cpu.fifo.text_1")}</p>
			<p>{t("help.modals.cpu.fifo.text_2")}</p>
			<p>{t("help.modals.cpu.fifo.text_3")}</p>
			<p>{t("help.modals.cpu.fifo.text_4")}</p>
			
			<h4>{t("cpu.algorithms.spn")}</h4>
			<p>{t("help.modals.cpu.spn.text_1")}</p>
			<p>{t("help.modals.cpu.spn.text_2")}</p>
			<p>{t("help.modals.cpu.spn.text_3")}</p>
			
			<h4>{t("cpu.algorithms.srtn")}</h4>
			<p>{t("help.modals.cpu.srtn.text_1")}</p>
			<p>{t("help.modals.cpu.srtn.text_2")}</p>
			<p>{t("help.modals.cpu.srtn.text_3")}</p>

			<h4>{t("cpu.algorithms.hrrn")}</h4>
			<p>{t("help.modals.cpu.hrrn.text_1")}</p>
			<p>{t("help.modals.cpu.hrrn.text_2")}</p>
			<Latex display>
				{`\\textrm{${t("cpu.ratio")}} = \\frac{\\textrm{${t("cpu.waiting_time")}} + T_s}{T_s}`}
			</Latex>
			<p>{t("help.modals.cpu.hrrn.text_3")}</p>
			<p>{t("help.modals.cpu.hrrn.text_4")}</p>

			<h4>{t("cpu.algorithms.rr")}</h4>
			<p>{t("help.modals.cpu.rr.text_1")}</p>
			<p>{t("help.modals.cpu.rr.text_2")}</p>
			
			<h4>{t("cpu.algorithms.feedback")}</h4>
			<p>{t("help.modals.cpu.feedback.text_1")}</p>
			<p>{t("help.modals.cpu.feedback.text_2")}</p>

			<p>
				{t("help.modals.cpu.feedback.text_3_1")}
				<Latex display={false}>
					{"2^i"}
				</Latex>
				{t("help.modals.cpu.feedback.text_3_2")}
			</p>
			<p>{t("help.modals.cpu.feedback.text_4")}</p>

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
					<li>
						El tiempo de retardo normalizado calculado a partir de &nbsp;
						<Latex display={false}>
							{"T_r / T_s"}
						</Latex>
					</li>
				</ul>

				De las columnas tiempo de retorno y tiempo de retorno normalizado se muestra la media de sus valores.
			</p>
		</>
	)
}

export default CPUHelp;