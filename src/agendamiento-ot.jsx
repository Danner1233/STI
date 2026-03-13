import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

// ✅ COMPONENTES MODULARES
import Autocheck from "./autocheck"; // ← CORRECTO
import ConfiguracionZoho from "./components/ConfiguracionZoho";
import Historial from "./components/Historial";
import GestionContactos from "./components/GestionContactos";
import Productividad from "./components/Productividad";
import ModalSelectorCC from "./components/ModalSelectorCC";
import ParafiscalesMensuales from "./components/ParafiscalesMensuales";
import Formulario from "./components/Formulario";
import VistaPrevia from "./components/VistaPrevia";
import Estadisticas from "./components/Estadisticas";
import RegistroRapido from "./components/RegistroRapido";
import OTsPendientes from "./components/OTsPendientes";
import FloatingModal from "./components/FloatingModal";
import BusquedaRapida from "./components/BusquedaRapida";
import ZonificadorMejorado from "./components/ZonificadorMejorado";
import GuiaEscalamiento from "./components/GuiaEscalamiento";

// 🆕 NUEVOS COMPONENTES
import Dashboard from "./components/Dashboard";
import ReportesAutomaticos from "./components/ReportesAutomaticos";
import PlantillasCorreo from "./components/PlantillasCorreo";
import useJSONDatabase from "./hooks/useJSONDatabase";

// Iconos
import {
  Settings,
  Clock,
  Menu,
  X,
  Map,
  Search,
  BookOpen,
  FileSpreadsheet,
  Bell,
  ChevronDown,
  BarChart3,
  Mail,
  FileText,
} from "lucide-react";

// Logo SVG Component
const LogoEmpresa = ({ imageUrl }) => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="circleClip">
        <circle cx="50" cy="50" r="45" />
      </clipPath>
    </defs>
    <circle
      cx="50"
      cy="50"
      r="48"
      fill="#1E40AF"
      stroke="#F97316"
      strokeWidth="2"
    />
    {imageUrl && (
      <image
        href={imageUrl}
        x="5"
        y="5"
        width="90"
        height="90"
        clipPath="url(#circleClip)"
        preserveAspectRatio="xMidYMid slice"
      />
    )}
  </svg>
);

const AgendamientoOT = () => {
  // ========== ESTADOS ==========
  const [formData, setFormData] = useState({
    numeroOT: "",
    cliente: "",
    ciudad: "",
    direccion: "",
    fecha: "",
    hora: "",
    correoDestino: "",
    contacto: "",
    telefono: "",
    tipoServicio: "ENTREGA DE SERVICIO",
    observaciones: "",
    duracion: "4-8 horas",
    consensus: false,
    tablaPersonalizada: "",
    copiaCC: [],
  });

  const [contactosGuardados, setContactosGuardados] = useState(() => {
    const saved = localStorage.getItem("contactos-guardados");
    return saved
      ? JSON.parse(saved)
      : [
          { nombre: "Santiago Cornejo", email: "santiago.cornejo@sti.com.co" },
          { nombre: "Danner Arias", email: "danner.arias@sti.com.co" },
        ];
  });

  const [inputCC, setInputCC] = useState("");
  const [sugerenciasCC, setSugerenciasCC] = useState([]);

  const [parafiscalesMensuales, setParafiscalesMensuales] = useState(() => {
    const saved = localStorage.getItem("parafiscales-mensuales");
    return saved
      ? JSON.parse(saved)
      : {
          mes: new Date().toISOString().slice(0, 7),
          tecnicos: [
            {
              nombre: "DANIEL JARAMILLO BETANCUR",
              cedula: "10.050.343",
              eps: "SO S SERVICIO OCCIDENTAL DE SALUD S A",
              arl: "COLPATRIA ARL",
            },
          ],
        };
  });

  const [mostrarParafiscalesMensuales, setMostrarParafiscalesMensuales] =
    useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarAutocheck, setMostrarAutocheck] = useState(false);
  const [mostrarGestionContactos, setMostrarGestionContactos] = useState(false);
  const [mostrarSelectorMultiple, setMostrarSelectorMultiple] = useState(false);
  const [mostrarConfigZoho, setMostrarConfigZoho] = useState(false);
  const [mostrarPendientes, setMostrarPendientes] = useState(false);
  const [forceUpdatePendientes, setForceUpdatePendientes] = useState(0);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarZonificador, setMostrarZonificador] = useState(false);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [mostrarGuiaEscalamiento, setMostrarGuiaEscalamiento] = useState(false);
  // 🆕 NUEVOS ESTADOS
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [mostrarReportes, setMostrarReportes] = useState(false);
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);

  const [archivoZip, setArchivoZip] = useState(null);
  const fileInputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  const [zohoConfig, setZohoConfig] = useState(() => {
    const saved = localStorage.getItem("zoho-config");
    return saved
      ? JSON.parse(saved)
      : {
          email: "",
          password: "",
          fromEmail: "agendamiento@sti.com.co",
          clientId: "",
          clientSecret: "",
          refreshToken: "",
        };
  });

  const {
    data: productividad,
    setData: setProductividad,
    loading: _loadingDB, // Prefijo _ indica que es intencional no usarla
    saveData,
  } = useJSONDatabase("productividad", true);

  // ========== EFFECTS ==========
  useEffect(() => {
    localStorage.setItem(
      "contactos-guardados",
      JSON.stringify(contactosGuardados),
    );
  }, [contactosGuardados]);

  useEffect(() => {
    localStorage.setItem(
      "parafiscales-mensuales",
      JSON.stringify(parafiscalesMensuales),
    );
  }, [parafiscalesMensuales]);

  /* useEffect(() => {
    try {
      const registrosLimitados = productividad.slice(0, 500);
      localStorage.setItem("productividad-ot", JSON.stringify(registrosLimitados));
      
      if (productividad.length > 500) {
        console.warn(`⚠️ Productividad tiene ${productividad.length} registros. Solo se guardan los últimos 500.`);
      }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('❌ LocalStorage lleno. Limpiando registros antiguos...');
        
        try {
          const registrosEmergencia = productividad.slice(0, 100);
          localStorage.setItem("productividad-ot", JSON.stringify(registrosEmergencia));
          alert(
            '⚠️ ADVERTENCIA: LocalStorage lleno\n\n' +
            'Se han guardado solo los últimos 100 registros.\n\n' +
            'Recomendación: Exporta tu historial completo a Excel y limpia registros antiguos.'
          );
        } catch (e) {
          console.error('❌ No se pudo guardar ni con limpieza de emergencia:', e);
          alert('❌ Error crítico: No se puede guardar en localStorage. Exporta tus datos YA.');
        }
      } else {
        console.error('Error guardando productividad:', error);
      }
    }
  }, [productividad]); */

  useEffect(() => {
    localStorage.setItem("zoho-config", JSON.stringify(zohoConfig));
  }, [zohoConfig]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setMostrarBusqueda(true);
      }
      if (e.key === "Escape" && mostrarBusqueda) {
        setMostrarBusqueda(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mostrarBusqueda]);

  useEffect(() => {
    const pendientes = productividad.filter((ot) => ot.estado === "Pendiente");
    if (pendientes.length > 0) {
      const timer = setTimeout(() => {
        alert(
          `⏰ RECORDATORIO:\n\nTienes ${pendientes.length} OT(s) pendiente(s)`,
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [productividad]);

  // 🆕 ESCUCHAR MENSAJES DEL POPUP

  // ========== HANDLERS ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputCCChange = (e) => {
    const value = e.target.value;
    setInputCC(value);

    if (value.length > 0) {
      const sugerencias = contactosGuardados.filter((contacto) => {
        const match =
          contacto.nombre.toLowerCase().includes(value.toLowerCase()) ||
          contacto.email.toLowerCase().includes(value.toLowerCase());
        const yaAgregado = formData.copiaCC.some(
          (cc) => cc.email === contacto.email,
        );
        return match && !yaAgregado;
      });
      setSugerenciasCC(sugerencias);
    } else {
      setSugerenciasCC([]);
    }
  };

  const agregarCC = (contacto) => {
    if (
      contacto.email &&
      !formData.copiaCC.some((cc) => cc.email === contacto.email)
    ) {
      setFormData((prev) => ({
        ...prev,
        copiaCC: [...prev.copiaCC, contacto],
      }));
    }
    setInputCC("");
    setSugerenciasCC([]);
  };

  const handleKeyDownCC = (e) => {
    if (e.key === "Enter" && inputCC.trim()) {
      e.preventDefault();

      if (sugerenciasCC.length > 0) {
        agregarCC(sugerenciasCC[0]);
      } else if (inputCC.includes("@")) {
        const nuevoContacto = {
          nombre: inputCC.split("@")[0],
          email: inputCC.trim(),
        };
        agregarCC(nuevoContacto);
      }
    }
  };

  const eliminarCC = (emailAEliminar) => {
    setFormData((prev) => ({
      ...prev,
      copiaCC: prev.copiaCC.filter((cc) => cc.email !== emailAEliminar),
    }));
  };

  const agregarMultiplesCC = (contactosSeleccionados) => {
    const nuevosCC = contactosSeleccionados.filter(
      (contacto) => !formData.copiaCC.some((cc) => cc.email === contacto.email),
    );
    if (nuevosCC.length > 0) {
      setFormData((prev) => ({
        ...prev,
        copiaCC: [...prev.copiaCC, ...nuevosCC],
      }));
    }
  };

  const handleArchivoZip = (e) => {
    const file = e.target.files[0];
    if (file) setArchivoZip(file);
  };

  const handleZohoConfigChange = (e) => {
    const { name, value } = e.target;
    setZohoConfig((prev) => ({ ...prev, [name]: value }));
  };

  // ========== PARAFISCALES ==========
  const agregarTecnicoMensual = () => {
    setParafiscalesMensuales((prev) => ({
      ...prev,
      tecnicos: [
        ...prev.tecnicos,
        { nombre: "", cedula: "", eps: "", arl: "" },
      ],
    }));
  };

  const actualizarTecnicoMensual = (index, campo, valor) => {
    setParafiscalesMensuales((prev) => ({
      ...prev,
      tecnicos: prev.tecnicos.map((tec, i) =>
        i === index ? { ...tec, [campo]: valor } : tec,
      ),
    }));
  };

  const eliminarTecnicoMensual = (index) => {
    setParafiscalesMensuales((prev) => ({
      ...prev,
      tecnicos: prev.tecnicos.filter((_, i) => i !== index),
    }));
  };

  const actualizarMesParafiscales = (nuevoMes) => {
    setParafiscalesMensuales((prev) => ({ ...prev, mes: nuevoMes }));
  };

  const importarParafiscalesExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("⚠️ Por favor selecciona un archivo Excel");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const nuevosTecnicos = jsonData.map((row) => ({
          nombre: row["Nombre"] || row["nombre"] || "",
          cedula: row["Cédula"] || row["Cedula"] || "",
          eps: row["EPS"] || row["eps"] || "",
          arl: row["ARL"] || row["arl"] || "",
        }));

        setParafiscalesMensuales((prev) => ({
          ...prev,
          tecnicos: nuevosTecnicos,
        }));
        alert(`✅ ${nuevosTecnicos.length} técnicos importados!`);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error al cargar Excel:", err);
      alert("❌ Error al cargar el archivo");
    }
    e.target.value = "";
  };

  // ========== CONTACTOS ==========
  const agregarNuevoContacto = () => {
    setContactosGuardados((prev) => [...prev, { nombre: "", email: "" }]);
  };

  const actualizarContacto = (index, campo, valor) => {
    setContactosGuardados((prev) =>
      prev.map((contacto, i) =>
        i === index ? { ...contacto, [campo]: valor } : contacto,
      ),
    );
  };

  const eliminarContacto = (index) => {
    setContactosGuardados((prev) => prev.filter((_, i) => i !== index));
  };

  const sincronizarContactosZoho = async () => {
    if (
      !zohoConfig.clientId ||
      !zohoConfig.clientSecret ||
      !zohoConfig.refreshToken
    ) {
      alert("⚠️ Configura tus credenciales OAuth primero");
      setMostrarConfigZoho(true);
      return;
    }
  };

  // ========== GENERADORES ==========
  const generarAsunto = () => {
    return `CLARO COLOMBIA ENTREGA DE SERVICIO-${formData.cliente.toUpperCase()}- OT ${formData.numeroOT}`;
  };

  const generarCuerpo = () => {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ];
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    let fechaFormateada = "";
    if (formData.fecha) {
      const fecha = new Date(formData.fecha + "T00:00:00");
      fechaFormateada = `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
    }

    return `
    ===================📧 CORREO====================


Buen dia

Señores

${formData.cliente.toUpperCase()}

Queremos confirmarle la actividad de ${formData.tipoServicio.toUpperCase()} para la sede relacionada en el cuadro. Le solicitamos permisos de ingreso tanto administrativos como tecnicos para el ingreso a la sede en mencion.

Se requiere de un acompañamiento para realizar pruebas pertinentes.

Duracion de la actividad: ${formData.duracion}

┌─────────────────────────────────────────────────────────────────────┐
│                     INFORMACIÓN DE LA OT                            │
├──────────────┬──────────────┬────────┬─────────────┬────────────────┤
│     OT       │    FECHA     │  HORA  │   CIUDAD    │   DIRECCIÓN    │
├──────────────┼──────────────┼────────┼─────────────┼────────────────┤
│ ${(formData.numeroOT || "").padEnd(12)} │ ${(fechaFormateada || "").padEnd(12)} │ ${(formData.hora || "").padEnd(6)} │ ${(formData.ciudad || "").padEnd(11)} │ ${(formData.direccion || "").padEnd(14)} │
└──────────────┴──────────────┴────────┴─────────────┴────────────────┘

Consideramos oportuno recordarle que para que esta obra pueda completarse es necesario solicitar acompañamiento por parte del personal de mantenimiento de las instalaciones. De la misma forma, quisieramos pec celular de la persona de contacto en sitio. Esto nos sera muy util para estar en contacto con el.

Cordialmente,

Analista de Agendamientos Proyectos
Danner Arias Munive
CLARO Colombia

Conmutador: Call: 4896060, Medellin: 6051111, B/quilla: 3852323`;
  };

  const generarCuerpoHTML = () => {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ];
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    let fechaFormateada = "";
    if (formData.fecha) {
      const fecha = new Date(formData.fecha + "T00:00:00");
      const diaSemana = dias[fecha.getDay()];
      const dia = fecha.getDate();
      const mes = meses[fecha.getMonth()];
      const año = fecha.getFullYear();
      fechaFormateada = `${diaSemana} ${dia} de ${mes} de ${año}`;
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <p>Buen dia</p>
        <p>Señores</p>
        <p><strong>${formData.cliente.toUpperCase()}</strong></p>
        
        <p>Queremos confirmarle la actividad de <strong>${formData.tipoServicio.toUpperCase()}</strong> para la sede relacionada en el cuadro. Le solicitamos permisos de ingreso tanto administrativos como tecnicos para el ingreso a la sede en mencion.</p>
        <p>se requiere de un acompañamiento para realizar pruebas pertinentes</p>
        
        <p><strong>Duracion de la actividad:</strong> ${formData.duracion}</p>
        
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr style="background-color: #e30613; color: white;">
              <th>OT</th>
              <th>FECHA</th>
              <th>HORA</th>
              <th>CIUDAD</th>
              <th>DIRECCION</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${formData.numeroOT}</td>
              <td>${fechaFormateada}</td>
              <td>${formData.hora}</td>
              <td>${formData.ciudad}</td>
              <td>${formData.direccion}</td>
            </tr>
          </tbody>
        </table>
        
        <p>Consideramos oportuno recordarle que para que esta obra pueda completarse es necesario solicitar acompañamiento por parte del personal de mantenimiento de las instalaciones. De la misma forma, quisieramos pec celular de la persona de contacto en sitio. Esto nos sera muy util para estar en contacto con el.</p>
        
        ${
          formData.tablaPersonalizada
            ? formData.tablaPersonalizada
            : `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr style="background-color: #e30613; color: white;">
              <th>Nombre</th>
              <th>Cedula</th>
              <th>EPS</th>
              <th>ARL</th>
            </tr>
          </thead>
          <tbody>
            ${parafiscalesMensuales.tecnicos
              .map(
                (tec) => `
              <tr>
                <td>${tec.nombre}</td>
                <td>${tec.cedula}</td>
                <td>${tec.eps}</td>
                <td>${tec.arl}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>`
        }

        <!-- FIRMA CORPORATIVA -->
        <div style="margin-top: 40px;">
          <p style="margin: 5px 0;"><strong>Cordialmente,</strong></p>
          <br>
          <div style="border-left: 4px solid #e30613; padding-left: 15px;">
            <p style="margin: 5px 0; font-weight: bold; color: #e30613;">Analista de Agendamientos Proyectos</p>
            <p style="margin: 5px 0; font-weight: bold; color: #e30613;">Danner Arias Munive</p>
            <p style="margin: 5px 0; color: #999;">CLARO Colombia</p>
            <br>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">Conmutador: Call: 4896060, Medellin: 6051111, B/quilla: 3852323</p>
          </div>
          <br>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 5px 0; font-weight: bold; color: #e30613; font-size: 11px;">AVISO DE CONFIDENCIALIDAD:</p>
            <p style="margin: 5px 0; color: #666; font-size: 10px; line-height: 1.4;">
              Este correo electronico, incluyendo en su caso, los archivos adjuntos al mismo, pueden contener informacion de caracter confidencial y/o privilegiada, y se envian a la atencion unica y exclusivamente de la persona y/o entidad a quien va dirigido. La copia, revision, uso, revelacion y/o distribucion de dicha informacion confidencial sin la autorizacion por escrito de Telmex Colombia S.A esta prohibida. Si usted no es el destinatario o quien se dirige el presente correo, favor de contactar al remitente respondiendo al presente correo y eliminar el correo original incluyendo sus archivos, asi como cualquier copia del mismo. Mediante la recepcion del presente correo usted reconoce y acepta que en caso de incumplimiento de su parte y/o de sus representantes a los terminos antes mencionados, Telmex Colombia S.A tendra derecho a los daños y perjuicios que esto le cause.
            </p>
            <br>
            <p style="margin: 5px 0; font-weight: bold; color: #e30613; font-size: 11px;">CONFIDENTIALITY NOTICE:</p>
            <p style="margin: 5px 0; color: #666; font-size: 10px; line-height: 1.4;">
              This e-mail message including attachments, if any, is intended only for the person or entity to which it is addressed and may contain confidential and /or privileged material. Any review, use, disclosure or distribution of such confidential information without the written authorization of Telmex Colombia S.A is prohibited. If you are not the intended recipient, please contact the sender by reply e-mail and destroy all copies of the original message. By receiving this e-mail you acknowledge that any breach by you and/or your representatives of the above provisions may entitle Telmex Colombia S.A to seek for damages.
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // ========== ACCIONES ==========
  const copiarCorreo = () => {
    const camposFaltantes = [];
    if (!formData.numeroOT) camposFaltantes.push("Número OT");
    if (!formData.cliente) camposFaltantes.push("Cliente");

    if (camposFaltantes.length > 0) {
      alert(`⚠️ Completa: ${camposFaltantes.join(", ")}`);
      return;
    }

    const asunto = generarAsunto();
    const cuerpo = generarCuerpo();
    navigator.clipboard
      .writeText(`ASUNTO:\n${asunto}\n\n${cuerpo}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const copiarCorreoHTML = async () => {
    const camposFaltantes = [];
    if (!formData.numeroOT) camposFaltantes.push("Número OT");
    if (!formData.cliente) camposFaltantes.push("Cliente");

    if (camposFaltantes.length > 0) {
      alert(`⚠️ Completa: ${camposFaltantes.join(", ")}`);
      return;
    }

    const asunto = generarAsunto();
    const cuerpoHTML = generarCuerpoHTML();

    try {
      // Crear un elemento temporal para copiar HTML
      const blob = new Blob([cuerpoHTML], { type: "text/html" });
      const clipboardItem = new ClipboardItem({ "text/html": blob });

      await navigator.clipboard.write([clipboardItem]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      alert(
        "✅ Correo HTML copiado al portapapeles!\n\n" +
          "📋 PASOS:\n" +
          "1. Abre Outlook\n" +
          "2. Nuevo correo\n" +
          "3. Pega en el cuerpo (Ctrl+V)\n" +
          "4. La tabla se verá perfectamente formateada\n\n" +
          `📧 ASUNTO:\n${asunto}\n\n` +
          `📨 PARA: ${formData.correoDestino}`,
      );
    } catch (err) {
      // Fallback si no funciona el clipboard API
      console.error("Error copiando HTML:", err);

      // Copiar como texto plano como alternativa
      const textoCompleto = `ASUNTO:\n${asunto}\n\n${cuerpoHTML}`;
      navigator.clipboard.writeText(textoCompleto).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        alert(
          "✅ Correo copiado (texto)!\n\nPega en Outlook y formatea manualmente.",
        );
      });
    }
  };

  const enviarCorreoOutlook = async () => {
    // Validación de Consensus
    if (!formData.consensus) {
      const confirmacion = window.confirm(
        "⚠️⚠️⚠️ ATENCIÓN URGENTE ⚠️⚠️⚠️\n\n" +
          "🚨 NO HAS MARCADO QUE AGENDASTE EN CONSENSUS 🚨\n\n" +
          '❌ El checkbox de "Agendado en Consensus" está DESMARCADO\n\n' +
          "¿Ya agendaste esta OT en la plataforma de Consensus?\n\n" +
          '• SI ya la agendaste → Click "Cancelar", marca el checkbox y envía de nuevo\n' +
          '• NO la has agendado → Click "Cancelar" y NO ENVÍES ESTE CORREO hasta agendar\n\n' +
          "⚠️ ¿Estás ABSOLUTAMENTE SEGURO de que quieres enviar sin marcar Consensus?",
      );

      if (!confirmacion) {
        alert(
          "✅ Correo NO enviado.\n\n📋 Por favor:\n1. Agenda la OT en Consensus\n2. Marca el checkbox\n3. Intenta enviar de nuevo",
        );
        return;
      }

      const segundaConfirmacion = window.confirm(
        "🚨 ÚLTIMA ADVERTENCIA 🚨\n\n" +
          "Estás a punto de enviar un correo SIN agendar en Consensus.\n\n" +
          "Esto puede causar problemas graves:\n" +
          "• Descoordinación con el equipo\n" +
          "• Pérdida de seguimiento\n" +
          "• Incumplimiento de procesos\n\n" +
          "¿REALMENTE quieres continuar sin Consensus?",
      );

      if (!segundaConfirmacion) {
        alert(
          "✅ Correo NO enviado.\n\n¡Gracias por verificar! Agenda en Consensus primero.",
        );
        return;
      }
    }

    // Generar datos del correo
    const asunto = generarAsunto();
    const cuerpoHTML = generarCuerpoHTML();

    // Copiar HTML al portapapeles
    try {
      const blob = new Blob([cuerpoHTML], { type: "text/html" });
      const clipboardItem = new ClipboardItem({ "text/html": blob });
      await navigator.clipboard.write([clipboardItem]);
      console.log("✅ HTML copiado al portapapeles");
    } catch (err) {
      console.error("Error copiando HTML:", err);
      await navigator.clipboard.writeText(cuerpoHTML);
    }

    // Crear URL de Outlook Web
    const destinatario = encodeURIComponent(formData.correoDestino);
    const asuntoEncoded = encodeURIComponent(asunto);
    const ccEncoded = encodeURIComponent(
      formData.copiaCC.map((c) => c.email).join(";"),
    );

    let outlookUrl = `https://outlook.office.com/mail/0/deeplink/compose?to=${destinatario}&subject=${asuntoEncoded}`;

    if (formData.copiaCC.length > 0) {
      outlookUrl += `&cc=${ccEncoded}`;
    }

    console.log("🔗 URL generada:", outlookUrl);

    // Abrir Outlook Web
    const ventana = window.open(outlookUrl, "_blank");

    if (!ventana || ventana.closed || typeof ventana.closed === "undefined") {
      // Bloqueador de pop-ups
      alert(
        "🚫 BLOQUEADOR DE POP-UPS\n\n" +
          "Permite pop-ups para este sitio.\n\n" +
          "📋 DATOS COPIADOS:\n" +
          `Para: ${formData.correoDestino}\n` +
          `CC: ${formData.copiaCC.map((c) => c.email).join(", ")}\n` +
          `Asunto: ${asunto}\n\n` +
          "Abre Outlook Web manualmente y pega el cuerpo (Ctrl+V)",
      );
    } else {
      // Mostrar instrucciones
      setTimeout(() => {
        alert(
          "✅ Outlook Web abierto\n\n" +
            "📋 VERIFICAR:\n" +
            `✓ Para: ${formData.correoDestino}\n` +
            `✓ Asunto: ${asunto.substring(0, 50)}...\n` +
            `✓ CC: ${formData.copiaCC.length} contactos\n\n` +
            "📝 PASOS:\n" +
            "1. Click en el cuerpo del correo\n" +
            "2. Ctrl+V para pegar\n" +
            "3. ✅ Tabla aparece con formato\n" +
            "4. Revisar y dar 'Enviar'",
        );
      }, 1500);

      // Confirmar registro
      setTimeout(() => {
        const confirmarRegistro = window.confirm(
          "📧 ¿Ya enviaste el correo?\n\n" +
            "• Aceptar → Se registra en productividad\n" +
            "• Cancelar → No se registra",
        );

        if (confirmarRegistro) {
          registrarEnvio();
        }
      }, 4000);
    }
  };

  const registrarEnvio = async () => {
    const otExistente = productividad.find(
      (ot) => ot.numeroOT === formData.numeroOT,
    );

    let nuevaProductividad;

    if (otExistente) {
      nuevaProductividad = productividad.map((ot) =>
        ot.numeroOT === formData.numeroOT
          ? {
              ...ot,
              ...formData,
              fechaEnvio: new Date().toISOString(),
              estado: "Enviado",
              observaciones: formData.observaciones || ot.observaciones,
              actualizadoRecientemente: true,
            }
          : ot,
      );
      console.log(
        `✅ OT ${formData.numeroOT} ACTUALIZADA de "Pendiente" a "Enviado" (sin duplicar)`,
      );
    } else {
      const nuevo = {
        id: Date.now(),
        ...formData,
        fechaEnvio: new Date().toISOString(),
        estado: "Enviado",
        rr: "",
      };
      nuevaProductividad = [nuevo, ...productividad];
      console.log(`✅ OT ${formData.numeroOT} CREADA en productividad`);
    }

    // 🗄️ Guardar en BD JSON
    await saveData(nuevaProductividad);

    setRegistrado(true);
    setTimeout(() => setRegistrado(false), 2000);

    const pendientes = JSON.parse(
      localStorage.getItem("ots-pendientes") || "[]",
    );
    const nuevosPendientes = pendientes.filter(
      (p) => p.numeroOT !== formData.numeroOT,
    );
    if (nuevosPendientes.length !== pendientes.length) {
      localStorage.setItem("ots-pendientes", JSON.stringify(nuevosPendientes));
      console.log(
        `✅ OT ${formData.numeroOT} quitada de pendientes automáticamente`,
      );

      setForceUpdatePendientes((prev) => {
        const newValue = prev + 1;
        console.log(`🔄 Force update pendientes: ${prev} → ${newValue}`);
        return newValue;
      });

      setTimeout(() => {
        alert(
          `✅ OT ${formData.numeroOT} quitada de pendientes y productividad actualizada`,
        );
      }, 100);
    }

    setFormData({
      numeroOT: "",
      cliente: "",
      ciudad: "",
      direccion: "",
      fecha: "",
      hora: "",
      correoDestino: "",
      contacto: "",
      telefono: "",
      tipoServicio: "ENTREGA DE SERVICIO",
      observaciones: "",
      duracion: "4-8 horas",
      consensus: false,
      tablaPersonalizada: "",
      copiaCC: [],
    });
    setArchivoZip(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const registrarRapido = async (datosRapidos) => {
    const otExistente = productividad.find(
      (ot) => ot.numeroOT === datosRapidos.numeroOT,
    );

    let nuevaProductividad;

    if (otExistente) {
      nuevaProductividad = productividad.map((ot) =>
        ot.numeroOT === datosRapidos.numeroOT
          ? {
              ...ot,
              rr: datosRapidos.rr || ot.rr,
              cliente: datosRapidos.cliente,
              fecha: datosRapidos.fecha || ot.fecha,
              tipoServicio: datosRapidos.tipoServicio,
              observaciones: datosRapidos.observaciones || ot.observaciones,
              consensus: datosRapidos.consensus,
              generarPDT: datosRapidos.generarPDT,
              servicioPDT: datosRapidos.servicioPDT || "",
              fechaEnvio: new Date().toISOString(),
              estado: "Enviado",
              actualizadoRecientemente: true,
            }
          : ot,
      );
      console.log(
        `✅ OT ${datosRapidos.numeroOT} ACTUALIZADA de "Pendiente" a "Enviado" (Registro Rápido - sin duplicar)`,
      );
    } else {
      const nuevoRegistro = {
        id: Date.now(),
        numeroOT: datosRapidos.numeroOT,
        rr: datosRapidos.rr || "",
        cliente: datosRapidos.cliente,
        ciudad: "",
        direccion: "",
        fecha: datosRapidos.fecha || "",
        hora: "",
        correoDestino: "",
        contacto: "",
        telefono: "",
        tipoServicio: datosRapidos.tipoServicio,
        observaciones:
          datosRapidos.observaciones ||
          "📝 Registro rápido - Sin correo enviado",
        duracion: "",
        consensus: datosRapidos.consensus,
        generarPDT: datosRapidos.generarPDT,
        servicioPDT: datosRapidos.servicioPDT || "",
        tablaPersonalizada: "",
        copiaCC: [],
        fechaEnvio: new Date().toISOString(),
        estado: "Enviado",
      };
      nuevaProductividad = [nuevoRegistro, ...productividad];
      console.log(
        `✅ OT ${datosRapidos.numeroOT} CREADA en productividad (Registro Rápido)`,
      );
    }

    // 🗄️ Guardar en BD JSON
    await saveData(nuevaProductividad);

    const pendientes = JSON.parse(
      localStorage.getItem("ots-pendientes") || "[]",
    );
    const nuevosPendientes = pendientes.filter(
      (p) => p.numeroOT !== datosRapidos.numeroOT,
    );
    if (nuevosPendientes.length !== pendientes.length) {
      localStorage.setItem("ots-pendientes", JSON.stringify(nuevosPendientes));
      console.log(
        `✅ OT ${datosRapidos.numeroOT} quitada de pendientes automáticamente (Registro Rápido)`,
      );

      setForceUpdatePendientes((prev) => {
        const newValue = prev + 1;
        console.log(
          `🔄 Force update pendientes (Registro Rápido): ${prev} → ${newValue}`,
        );
        return newValue;
      });

      setTimeout(() => {
        alert(
          `✅ OT ${datosRapidos.numeroOT} quitada de pendientes y productividad actualizada`,
        );
      }, 100);
    }
  };

  const actualizarEstadoOT = async (id, nuevoEstado) => {
    const nuevaProductividad = productividad.map((ot) =>
      ot.id === id ? { ...ot, estado: nuevoEstado } : ot,
    );
    await saveData(nuevaProductividad);
  };

  const actualizarRR = async (id, nuevoRR) => {
    const nuevaProductividad = productividad.map((ot) =>
      ot.id === id ? { ...ot, rr: nuevoRR } : ot,
    );
    await saveData(nuevaProductividad);
  };

  const borrarTodasLasOTs = async () => {
    const totalRegistros = productividad.length;

    if (totalRegistros === 0) {
      alert(
        "✅ No hay registros en productividad.\n\nProductividad ya está vacía.",
      );
      return;
    }

    if (
      confirm(
        `🗑️ BORRAR TODA LA PRODUCTIVIDAD\n\n` +
          `Se eliminarán TODOS los ${totalRegistros} registros de productividad.\n\n` +
          `⚠️ ADVERTENCIA:\n` +
          `• Esta acción es PERMANENTE\n` +
          `• NO se puede deshacer\n` +
          `• Se recomienda exportar a Excel primero\n\n` +
          `¿Estás SEGURO de que quieres borrar todo?`,
      )
    ) {
      if (
        confirm(
          `⚠️ ÚLTIMA CONFIRMACIÓN ⚠️\n\n` +
            `Vas a eliminar ${totalRegistros} registros.\n\n` +
            `¿Confirmas que quieres BORRAR TODO?\n\n` +
            `(Esta es tu última oportunidad para cancelar)`,
        )
      ) {
        await saveData([]);
        alert(
          `✅ Productividad borrada completamente.\n\n${totalRegistros} registros eliminados.\n\nBase de datos limpiada.`,
        );
      }
    }
  };

  const actualizarObservaciones = async (id, nuevasObservaciones) => {
    const ahora = new Date().toISOString();
    const nuevaProductividad = productividad.map((ot) =>
      ot.id === id
        ? {
            ...ot,
            observaciones: nuevasObservaciones,
            fechaEnvio: ahora,
            actualizadoRecientemente: true,
          }
        : ot,
    );

    await saveData(nuevaProductividad);

    alert(
      "✅ Observaciones actualizadas\n\n" +
        "📅 La fecha de esta OT se actualizó a HOY para reflejar la actividad reciente.\n\n" +
        '💡 Esta OT aparecerá ahora en los filtros de "Hoy" y "Semana".',
    );
  };

  const eliminarOT = async (id) => {
    const nuevaProductividad = productividad.filter((ot) => ot.id !== id);
    await saveData(nuevaProductividad);
  };

  const reutilizarCorreo = (ot) => {
    setFormData({
      ...ot,
      consensus: ot.consensus || false,
      copiaCC: ot.copiaCC || [],
    });
    setMostrarHistorial(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSeleccionarOT = (ot) => {
    setMostrarHistorial(true);
    setTimeout(() => {
      const elemento = document.getElementById(`ot-${ot.id}`);
      if (elemento) {
        elemento.scrollIntoView({ behavior: "smooth", block: "center" });
        elemento.classList.add("ring-4", "ring-blue-400");
        setTimeout(
          () => elemento.classList.remove("ring-4", "ring-blue-400"),
          2000,
        );
      }
    }, 300);
  };

  const handleOTAgendada = (otPendiente) => {
    setFormData((prev) => ({
      ...prev,
      numeroOT: otPendiente.numeroOT,
      cliente: otPendiente.cliente,
      ciudad: otPendiente.ciudad || "",
      direccion: otPendiente.direccion || "",
      contacto: otPendiente.contacto || "",
      telefono: otPendiente.telefono || "",
    }));

    setMostrarPendientes(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    alert(
      "📝 Formulario llenado con datos de la OT.\n\nCompleta los campos restantes (fecha, hora, correo destino) y envía el correo.",
    );
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      const { action, ot, numeroOT } = event.data;

      switch (action) {
        case "nueva-ot-pendiente": {
          console.log("✅ Nueva OT pendiente registrada desde popup:", ot);
          setForceUpdatePendientes((prev) => prev + 1);
          break;
        }

        case "eliminar-ot-pendiente": {
          console.log("🗑️ OT eliminada desde popup:", numeroOT);
          setForceUpdatePendientes((prev) => prev + 1);
          break;
        }

        case "agendar-ot": {
          console.log("📝 Agendar OT desde popup:", numeroOT);
          const pendientes = JSON.parse(
            localStorage.getItem("ots-pendientes") || "[]",
          );
          const otPendiente = pendientes.find((p) => p.numeroOT === numeroOT);
          if (otPendiente) {
            handleOTAgendada(otPendiente);
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleRegistrarPendienteEnProductividad = (registroProductividad) => {
    setProductividad((prev) => [registroProductividad, ...prev]);
    console.log(
      `✅ OT ${registroProductividad.numeroOT} registrada en productividad con estado "Pendiente"`,
    );
  };

  const handleActualizarProductividad = async (
    id,
    cambios,
    eliminar = false,
  ) => {
    if (eliminar) {
      const nuevaProductividad = productividad.filter((ot) => ot.id !== id);
      await saveData(nuevaProductividad);
      console.log(`✅ OT eliminada de productividad (ID: ${id})`);
    } else {
      const nuevaProductividad = productividad.map((ot) =>
        ot.id === id ? { ...ot, ...cambios } : ot,
      );
      await saveData(nuevaProductividad);
      console.log(`✅ OT actualizada en productividad (ID: ${id})`, cambios);
    }
  };

  const calcularEstadisticas = () => {
    const hoy = new Date().toDateString();
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    return {
      hoyCount: productividad.filter(
        (ot) => new Date(ot.fechaEnvio).toDateString() === hoy,
      ).length,
      semanaCount: productividad.filter(
        (ot) => new Date(ot.fechaEnvio) >= inicioSemana,
      ).length,
      mesCount: productividad.filter(
        (ot) => new Date(ot.fechaEnvio) >= inicioMes,
      ).length,
    };
  };

  const stats = calcularEstadisticas();
  const pendientesCount = JSON.parse(
    localStorage.getItem("ots-pendientes") || "[]",
  ).length;

  // 🆕 ========== POPUP FLOTANTE PERSISTENTE ==========
  // Variable global para controlar la ventana
  const ventanaPendientesRef = useRef(null);
  const intervaloReaperturaRef = useRef(null);

  const abrirPopupFlotante = () => {
    // Si ya existe y está abierta, solo enfocarla
    if (ventanaPendientesRef.current && !ventanaPendientesRef.current.closed) {
      ventanaPendientesRef.current.focus();
      return;
    }

    // 🆕 VENTANA MINI - Solo una esquinita
    const width = 280;
    const height = 400;
    const left = window.screen.width - width - 10;
    const top = window.screen.height - height - 60;

    // Abrir ventana popup
    ventanaPendientesRef.current = window.open(
      "",
      "OTsPendientes",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!ventanaPendientesRef.current) {
      alert("🚫 Permite pop-ups para este sitio");
      return;
    }

    const popup = ventanaPendientesRef.current;

    popup.document.open();
    popup.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTs</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: Arial, sans-serif;
          background: #f97316;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-size: 12px;
        }
        .header {
          background: #dc2626;
          color: white;
          padding: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h1 {
          font-size: 13px;
          font-weight: bold;
        }
        .contador {
          background: white;
          color: #dc2626;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: bold;
          font-size: 11px;
          margin-left: 5px;
        }
        .btn-refresh {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }
        .tabs {
          display: flex;
          background: white;
        }
        .tab {
          flex: 1;
          padding: 6px;
          background: #f3f4f6;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 10px;
        }
        .tab.active {
          background: white;
          color: #f97316;
          border-bottom: 2px solid #f97316;
        }
        .content {
          flex: 1;
          overflow-y: auto;
          background: white;
          padding: 8px;
        }
        .form-group {
          margin-bottom: 8px;
        }
        .form-group label {
          display: block;
          font-weight: bold;
          margin-bottom: 2px;
          font-size: 10px;
        }
        .form-group input {
          width: 100%;
          padding: 5px;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          font-size: 11px;
        }
        .btn {
          width: 100%;
          padding: 6px;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          font-size: 10px;
          margin-top: 4px;
        }
        .btn-primary {
          background: #22c55e;
          color: white;
        }
        .btn-danger {
          background: #dc2626;
          color: white;
        }
        .btn-secondary {
          background: #f97316;
          color: white;
        }
        .ot-card {
          background: #fff;
          border: 2px solid #f97316;
          border-radius: 4px;
          padding: 6px;
          margin-bottom: 6px;
        }
        .ot-numero {
          font-size: 12px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 3px;
        }
        .ot-info {
          font-size: 10px;
          color: #666;
          margin-bottom: 3px;
        }
        .empty {
          text-align: center;
          padding: 15px 5px;
          color: #666;
        }
        .empty-icon {
          font-size: 30px;
        }
        .success {
          background: #d1fae5;
          color: #065f46;
          padding: 6px;
          border-radius: 3px;
          margin-bottom: 8px;
          text-align: center;
          font-size: 10px;
        }
        .warning {
          background: #fef3c7;
          color: #92400e;
          padding: 6px;
          border-radius: 3px;
          margin-bottom: 6px;
          text-align: center;
          font-size: 10px;
        }
        .hidden { display: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔔 OTs<span class="contador" id="contador">0</span></h1>
        <button class="btn-refresh" id="btnRefresh">🔄</button>
      </div>

      <div class="tabs">
        <button class="tab active" id="tabLista">📋 Lista</button>
        <button class="tab" id="tabNueva">➕ Nueva</button>
      </div>

      <div id="contentLista" class="content"></div>

      <div id="contentNueva" class="content hidden">
        <div id="mensaje" class="hidden"></div>
        
        <form id="formRegistro">
          <div class="form-group">
            <label>OT *</label>
            <input type="text" id="numeroOT" required placeholder="22680001">
          </div>
          
          <div class="form-group">
            <label>Líder *</label>
            <input type="text" id="lider" required placeholder="Nombre">
          </div>
          
          <button type="submit" class="btn btn-primary">✅ REGISTRAR</button>
        </form>
      </div>

      <script>
        // Variables globales
        var currentTab = 'lista';

        // Actualizar contenido
        function actualizar() {
          var pendientes = JSON.parse(localStorage.getItem('ots-pendientes') || '[]');
          document.getElementById('contador').textContent = pendientes.length;
          
          var html = '';
          if (pendientes.length === 0) {
            html = '<div class="empty"><div class="empty-icon">✅</div><p>Sin OTs</p></div>';
          } else {
            html = '<div class="warning">⚠️ ' + pendientes.length + ' OT(s)</div>';
            
            pendientes.forEach(function(ot) {
              html += '<div class="ot-card">';
              html += '<div class="ot-numero">OT ' + ot.numeroOT + '</div>';
              html += '<div class="ot-info">Líder: ' + (ot.lider || 'N/A') + '</div>';
              html += '<button class="btn btn-secondary" data-ot="' + ot.numeroOT + '" data-action="agendar">✏️ AGENDAR</button>';
              html += '<button class="btn btn-danger" data-ot="' + ot.numeroOT + '" data-action="eliminar">🗑️ ELIMINAR</button>';
              html += '</div>';
            });
          }
          
          document.getElementById('contentLista').innerHTML = html;
          
          // Agregar eventos a botones
          var botones = document.querySelectorAll('[data-action]');
          botones.forEach(function(btn) {
            btn.addEventListener('click', function() {
              var action = this.getAttribute('data-action');
              var numeroOT = this.getAttribute('data-ot');
              
              if (action === 'eliminar') {
                eliminarOT(numeroOT);
              } else if (action === 'agendarar') {
                agendarOT(numeroOT);
              }
            });
          });
        }

        // Cambiar pestaña
        function cambiarTab(tab) {
          currentTab = tab;
          
          document.getElementById('tabLista').classList.remove('active');
          document.getElementById('tabNueva').classList.remove('active');
          document.getElementById('contentLista').classList.add('hidden');
          document.getElementById('contentNueva').classList.add('hidden');
          
          if (tab === 'lista') {
            document.getElementById('tabLista').classList.add('active');
            document.getElementById('contentLista').classList.remove('hidden');
            actualizar();
          } else {
            document.getElementById('tabNueva').classList.add('active');
            document.getElementById('contentNueva').classList.remove('hidden');
          }
        }

        // Registrar OT
        function registrarOT(e) {
          e.preventDefault();
          
          var numeroOT = document.getElementById('numeroOT').value.trim();
          var lider = document.getElementById('lider').value.trim();
          
          if (!numeroOT || !lider) {
            alert('⚠️ Completa todos los campos');
            return;
          }
          
          var pendientes = JSON.parse(localStorage.getItem('ots-pendientes') || '[]');
          
          var existe = pendientes.some(function(ot) {
            return ot.numeroOT === numeroOT;
          });
          
          if (existe) {
            alert('⚠️ OT ' + numeroOT + ' ya existe');
            return;
          }
          
          var nuevaOT = {
            numeroOT: numeroOT,
            lider: lider,
            fechaRegistro: new Date().toISOString()
          };
          
          pendientes.unshift(nuevaOT);
          localStorage.setItem('ots-pendientes', JSON.stringify(pendientes));
          
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ 
              action: 'nueva-ot-pendiente', 
              ot: nuevaOT 
            }, '*');
          }
          
          document.getElementById('mensaje').textContent = '✅ OT registrada';
          document.getElementById('mensaje').className = 'success';
          document.getElementById('numeroOT').value = '';
          document.getElementById('lider').value = '';
          
          setTimeout(function() {
            document.getElementById('mensaje').classList.add('hidden');
            cambiarTab('lista');
          }, 1500);
        }

        // Eliminar OT
        function eliminarOT(numeroOT) {
          if (!confirm('¿Eliminar OT ' + numeroOT + '?')) return;
          
          var pendientes = JSON.parse(localStorage.getItem('ots-pendientes') || '[]');
          pendientes = pendientes.filter(function(ot) {
            return ot.numeroOT !== numeroOT;
          });
          localStorage.setItem('ots-pendientes', JSON.stringify(pendientes));
          
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ 
              action: 'eliminar-ot-pendiente', 
              numeroOT: numeroOT 
            }, '*');
          }
          
          actualizar();
        }

        // Agendar OT
        function agendarOT(numeroOT) {
          if (window.opener && !window.opener.closed) {
            window.opener.focus();
            window.opener.postMessage({ 
              action: 'agendar-ot', 
              numeroOT: numeroOT 
            }, '*');
          } else {
            alert('⚠️ Ventana principal cerrada');
          }
        }

        // Event listeners
        document.getElementById('btnRefresh').addEventListener('click', actualizar);
        document.getElementById('tabLista').addEventListener('click', function() { cambiarTab('lista'); });
        document.getElementById('tabNueva').addEventListener('click', function() { cambiarTab('nueva'); });
        document.getElementById('formRegistro').addEventListener('submit', registrarOT);

        // Actualizar cada 30 segundos
        setInterval(actualizar, 30000);

        // Cargar inicial
        actualizar();

        // Confirmación al cerrar
        window.onbeforeunload = function(e) {
          var pendientes = JSON.parse(localStorage.getItem('ots-pendientes') || '[]');
          if (pendientes.length > 0) {
            return 'Hay ' + pendientes.length + ' OT(s) pendientes';
          }
        };
      </script>
    </body>
    </html>
  `);
    popup.document.close();

    // REAPERTURA AUTOMÁTICA
    if (intervaloReaperturaRef.current) {
      clearInterval(intervaloReaperturaRef.current);
    }

    intervaloReaperturaRef.current = setInterval(() => {
      const pendientesActuales = JSON.parse(
        localStorage.getItem("ots-pendientes") || "[]",
      );

      if (pendientesActuales.length > 0) {
        if (
          !ventanaPendientesRef.current ||
          ventanaPendientesRef.current.closed
        ) {
          abrirPopupFlotante();
        }
      } else {
        if (intervaloReaperturaRef.current) {
          clearInterval(intervaloReaperturaRef.current);
          intervaloReaperturaRef.current = null;
        }
      }
    }, 3000);
  };

  const detenerPopupPersistente = () => {
    if (intervaloReaperturaRef.current) {
      clearInterval(intervaloReaperturaRef.current);
      intervaloReaperturaRef.current = null;
    }
    if (ventanaPendientesRef.current && !ventanaPendientesRef.current.closed) {
      ventanaPendientesRef.current.close();
    }
    alert("✅ Popup persistente detenido");
  };
  // ========== FIN POPUP FLOTANTE ==========

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Header Profesional con Gradiente Corporativo */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 py-4 md:px-6 md:py-5">
            <div className="flex items-center justify-between gap-4">
              {/* Logo y Título */}
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <LogoEmpresa />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-white truncate">
                    Sistema de Agendamiento OT
                  </h1>
                  <p className="text-xs md:text-sm text-blue-100 hidden sm:block mt-0.5">
                    Gestión profesional de órdenes de trabajo
                  </p>
                </div>
              </div>

              {/* Notificaciones (Desktop) */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Botón OTs Pendientes - SIEMPRE VISIBLE */}
                <button
                  onClick={() => setMostrarPendientes(true)}
                  className={`relative px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 ${
                    pendientesCount > 0
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <Bell
                    size={18}
                    className={pendientesCount > 0 ? "animate-pulse" : ""}
                  />
                  <span className="font-semibold">{pendientesCount}</span>
                  {pendientesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      !
                    </span>
                  )}
                </button>

                {/* 🆕 BOTÓN POPUP FLOTANTE */}
                {pendientesCount > 0 && (
                  <button
                    onClick={abrirPopupFlotante}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    title="Abrir ventana flotante persistente"
                  >
                    <span className="text-lg">🪟</span>
                    <span className="font-semibold hidden xl:inline">
                      Popup Flotante
                    </span>
                  </button>
                )}

                {/* Botón de Búsqueda */}
                <button
                  onClick={() => setMostrarBusqueda(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm"
                >
                  <Search size={18} />
                  <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs bg-white/20 rounded">
                    Ctrl+K
                  </kbd>
                </button>

                {/* Menú Dropdown (Desktop) */}
                <div className="relative group">
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm">
                    <Settings size={18} />
                    <span className="hidden xl:inline">Herramientas</span>
                    <ChevronDown size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {/* 🆕 NUEVOS BOTONES */}
                      <button
                        onClick={() => setMostrarDashboard(true)}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 text-gray-700"
                      >
                        <BarChart3 size={16} className="text-purple-600" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => setMostrarReportes(true)}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-3 text-gray-700"
                      >
                        <Mail size={16} className="text-indigo-600" />
                        <span>Reportes Automáticos</span>
                      </button>
                      <button
                        onClick={() => setMostrarPlantillas(true)}
                        className="w-full text-left px-4 py-2 hover:bg-pink-50 flex items-center gap-3 text-gray-700"
                      >
                        <FileText size={16} className="text-pink-600" />
                        <span>Plantillas</span>
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      {/* BOTONES EXISTENTES */}
                      <button
                        onClick={() => setMostrarConfigZoho(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <Settings size={16} className="text-blue-600" />
                        <span>Configuración Zoho</span>
                      </button>
                      <button
                        onClick={() => setMostrarHistorial(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-lg">📜</span>
                        <span>Historial</span>
                      </button>
                      <button
                        onClick={() => setMostrarAutocheck(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-lg">✅</span>
                        <span>Autocheck</span>
                      </button>
                      <button
                        onClick={() => setMostrarParafiscalesMensuales(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-lg">📋</span>
                        <span>Parafiscales</span>
                      </button>
                      <button
                        onClick={() => setMostrarGestionContactos(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-lg">📧</span>
                        <span>Contactos</span>
                      </button>
                      <button
                        onClick={() => setMostrarZonificador(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <Map size={16} className="text-blue-600" />
                        <span>Zonificador</span>
                      </button>
                      <button
                        onClick={() => setMostrarGuiaEscalamiento(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <BookOpen size={16} className="text-purple-600" />
                        <span>Guía Escalamiento</span>
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={borrarTodasLasOTs}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-red-600"
                      >
                        <span className="text-lg">🗑️</span>
                        <span>Borrar Todo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Menú Móvil */}
              <button
                onClick={() => setMostrarMenu(!mostrarMenu)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition backdrop-blur-sm"
              >
                {mostrarMenu ? (
                  <X size={24} className="text-white" />
                ) : (
                  <Menu size={24} className="text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Menú Móvil Expandible */}
          {mostrarMenu && (
            <div className="lg:hidden border-t border-white/20 bg-gradient-to-b from-blue-800 to-blue-900">
              <div className="px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
                {pendientesCount > 0 && (
                  <button
                    onClick={() => {
                      setMostrarPendientes(true);
                      setMostrarMenu(false);
                    }}
                    className={`w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition shadow-lg ${
                      pendientesCount > 0
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Bell size={20} />
                      OTs Pendientes
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        pendientesCount > 0
                          ? "bg-white text-orange-600"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {pendientesCount}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMostrarBusqueda(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  <Search size={20} />
                  Búsqueda Rápida
                </button>
                {/* 🆕 BOTÓN POPUP FLOTANTE MÓVIL */}
                {pendientesCount > 0 && (
                  <button
                    onClick={() => {
                      abrirPopupFlotante();
                      setMostrarMenu(false);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition shadow-lg"
                  >
                    <span className="text-xl">🪟</span>
                    <span>Popup Flotante Persistente</span>
                  </button>
                )}
                <div className="h-px bg-white/20 my-2"></div>
                {/* 🆕 NUEVOS BOTONES MÓVIL */}
                <button
                  onClick={() => {
                    setMostrarDashboard(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  <BarChart3 size={20} />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setMostrarReportes(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  <Mail size={20} />
                  Reportes Automáticos
                </button>
                <button
                  onClick={() => {
                    setMostrarPlantillas(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  <FileText size={20} />
                  Plantillas
                </button>
                <div className="h-px bg-white/20 my-2"></div>
                {/* BOTONES EXISTENTES */}
                <button
                  onClick={() => {
                    setMostrarConfigZoho(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  <Settings size={20} />
                  Configuración Zoho
                </button>
                <button
                  onClick={() => {
                    setMostrarHistorial(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  📜 Historial
                </button>
                <button
                  onClick={() => {
                    setMostrarAutocheck(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  ✅ Autocheck
                </button>
                <button
                  onClick={() => {
                    setMostrarParafiscalesMensuales(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  📋 Parafiscales
                </button>
                <button
                  onClick={() => {
                    setMostrarGestionContactos(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  📧 Contactos
                </button>
                <button
                  onClick={() => {
                    setMostrarZonificador(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  <Map size={20} />
                  Zonificador
                </button>
                <button
                  onClick={() => {
                    setMostrarGuiaEscalamiento(true);
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  <BookOpen size={20} />
                  Guía Escalamiento
                </button>
                {/* 🆕 DETENER POPUP */}
                <button
                  onClick={detenerPopupPersistente}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-red-600"
                >
                  <span className="text-lg">🛑</span>
                  <span>Detener Popup Persistente</span>
                </button>
                ``` --- ## ✅ VERIFICACIÓN FINAL **Después de aplicar todos los
                cambios:** ``` □ Función abrirPopupFlotante() agregada □ Función
                detenerPopupPersistente() agregada □ useEffect de mensajes
                agregado □ Botón en header desktop agregado □ Botón en menú
                móvil agregado □ Opción detener en menú agregado □ Guardar
                archivo (Ctrl+S) □ Recargar página (F5)
                <div className="h-px bg-white/20 my-2"></div>
                <button
                  onClick={() => {
                    borrarTodasLasOTs();
                    setMostrarMenu(false);
                  }}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm border border-red-400/30"
                >
                  🗑️ Borrar Productividad
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Modales */}
        {mostrarHistorial && (
          <FloatingModal
            isOpen={mostrarHistorial}
            onClose={() => setMostrarHistorial(false)}
            title="Historial de OTs"
            icon="📜"
            color="cyan"
          >
            <Historial
              productividad={productividad}
              onReutilizar={reutilizarCorreo}
              onClose={() => setMostrarHistorial(false)}
            />
          </FloatingModal>
        )}

        {mostrarAutocheck && (
          <FloatingModal
            isOpen={mostrarAutocheck}
            onClose={() => setMostrarAutocheck(false)}
            title="Autocheck de OTs"
            icon="✅"
            color="orange"
            defaultWidth="max-w-6xl"
          >
            <Autocheck />
          </FloatingModal>
        )}

        {mostrarGestionContactos && (
          <FloatingModal
            isOpen={mostrarGestionContactos}
            onClose={() => setMostrarGestionContactos(false)}
            title="Gestión de Contactos"
            icon="📧"
            color="green"
          >
            <GestionContactos
              contactosGuardados={contactosGuardados}
              onAgregarNuevo={agregarNuevoContacto}
              onActualizar={actualizarContacto}
              onEliminar={eliminarContacto}
              onSincronizarZoho={sincronizarContactosZoho}
              onClose={() => setMostrarGestionContactos(false)}
            />
          </FloatingModal>
        )}

        {mostrarConfigZoho && (
          <FloatingModal
            isOpen={mostrarConfigZoho}
            onClose={() => setMostrarConfigZoho(false)}
            title="Configuración Zoho"
            icon="⚙️"
            color="indigo"
            defaultWidth="max-w-2xl"
          >
            <ConfiguracionZoho
              zohoConfig={zohoConfig}
              onConfigChange={handleZohoConfigChange}
              onClose={() => setMostrarConfigZoho(false)}
            />
          </FloatingModal>
        )}

        {mostrarParafiscalesMensuales && (
          <FloatingModal
            isOpen={mostrarParafiscalesMensuales}
            onClose={() => setMostrarParafiscalesMensuales(false)}
            title="Parafiscales Mensuales"
            icon="📋"
            color="purple"
            defaultWidth="max-w-6xl"
          >
            <ParafiscalesMensuales
              parafiscalesMensuales={parafiscalesMensuales}
              onActualizarMes={actualizarMesParafiscales}
              onAgregarTecnico={agregarTecnicoMensual}
              onActualizarTecnico={actualizarTecnicoMensual}
              onEliminarTecnico={eliminarTecnicoMensual}
              onImportarExcel={importarParafiscalesExcel}
              onClose={() => setMostrarParafiscalesMensuales(false)}
            />
          </FloatingModal>
        )}

        {/* 🆕 NUEVOS MODALES */}
        {mostrarDashboard && (
          <FloatingModal
            isOpen={mostrarDashboard}
            onClose={() => setMostrarDashboard(false)}
            title="Dashboard de Métricas"
            icon="📊"
            color="purple"
            defaultWidth="max-w-7xl"
          >
            <Dashboard productividad={productividad} />
          </FloatingModal>
        )}

        {mostrarReportes && (
          <ReportesAutomaticos
            productividad={productividad}
            zohoConfig={zohoConfig}
            onClose={() => setMostrarReportes(false)}
          />
        )}

        {mostrarPlantillas && (
          <PlantillasCorreo onClose={() => setMostrarPlantillas(false)} />
        )}

        {/* Estadísticas con diseño corporativo */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-orange-500 px-6 py-3">
              <h2 className="text-white font-bold text-lg">
                Estadísticas de Productividad
              </h2>
            </div>
            <div className="p-6">
              <Estadisticas
                hoyCount={stats.hoyCount}
                semanaCount={stats.semanaCount}
                mesCount={stats.mesCount}
              />
            </div>
          </div>
        </div>

        {/* Registro Rápido */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
            <div className="bg-gradient-to-r from-orange-500 to-blue-600 px-6 py-3">
              <h2 className="text-white font-bold text-lg">
                ⚡ Registro Rápido
              </h2>
            </div>
            <div className="p-6">
              <RegistroRapido onRegistrar={registrarRapido} />
            </div>
          </div>
        </div>

        {/* Formulario y Vista Previa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <h2 className="text-white font-bold text-lg">
                📝 Formulario de OT
              </h2>
            </div>
            <div className="p-6">
              <Formulario
                formData={formData}
                onInputChange={handleInputChange}
                inputCC={inputCC}
                onInputCCChange={handleInputCCChange}
                onKeyDownCC={handleKeyDownCC}
                sugerenciasCC={sugerenciasCC}
                onAgregarCC={agregarCC}
                onEliminarCC={eliminarCC}
                onMostrarSelectorMultiple={() =>
                  setMostrarSelectorMultiple(true)
                }
                archivoZip={archivoZip}
                onArchivoZipChange={handleArchivoZip}
                fileInputRef={fileInputRef}
                onEliminarArchivo={() => {
                  setArchivoZip(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                onCopiarCorreoHTML={copiarCorreoHTML}
                onCopiarCorreo={copiarCorreo}
                onEnviarCorreo={enviarCorreoOutlook} // ← NUEVO: Usa Outlook
                copied={copied}
                registrado={registrado}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3">
                <h2 className="text-white font-bold text-lg">
                  👁️ Vista Previa
                </h2>
              </div>
              <div className="p-6">
                <VistaPrevia
                  asunto={generarAsunto()}
                  cuerpo={generarCuerpo()}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-3">
                <h2 className="text-white font-bold text-lg">
                  📊 Productividad Reciente
                </h2>
              </div>
              <div className="p-6">
                <Productividad
                  productividad={productividad}
                  onActualizarEstado={actualizarEstadoOT}
                  onActualizarRR={actualizarRR}
                  onActualizarObservaciones={actualizarObservaciones}
                  onEliminarOT={eliminarOT}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Corporativo */}
        <div className="mt-8 bg-gradient-to-r from-blue-900 to-orange-600 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 100 100" fill="none">
                    <circle
                      cx="50"
                      cy="50"
                      r="48"
                      fill="white"
                      fillOpacity="0.2"
                    />
                    <path
                      d="M 35 30 Q 50 25 65 30 Q 70 35 65 40 Q 50 45 50 50 Q 50 55 65 60 Q 70 65 65 70 Q 50 75 35 70"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Sistema de Agendamiento OT
                  </p>
                  <p className="text-xs opacity-80">
                    Gestión Profesional de Órdenes de Trabajo
                  </p>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm font-semibold">
                  📊 Registros:{" "}
                  <span className="text-orange-300">
                    {productividad.length}
                  </span>
                </p>
                {productividad.length > 400 && (
                  <p className="text-xs text-orange-200 mt-1">
                    ⚠️ Considera exportar y limpiar datos antiguos
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modales adicionales */}
        {mostrarSelectorMultiple && (
          <ModalSelectorCC
            contactosGuardados={contactosGuardados}
            copiaCC={formData.copiaCC}
            onAgregar={agregarMultiplesCC}
            onClose={() => setMostrarSelectorMultiple(false)}
            onAbrirGestionContactos={() => {
              setMostrarSelectorMultiple(false);
              setMostrarGestionContactos(true);
            }}
          />
        )}

        {mostrarPendientes && (
          <OTsPendientes
            key={forceUpdatePendientes}
            onClose={() => setMostrarPendientes(false)}
            onOTAgendada={handleOTAgendada}
            onRegistrarEnProductividad={handleRegistrarPendienteEnProductividad}
            onActualizarProductividad={handleActualizarProductividad}
          />
        )}

        {mostrarZonificador && (
          <FloatingModal
            isOpen={mostrarZonificador}
            onClose={() => setMostrarZonificador(false)}
            title="Zonificador Nacional - Buscador de Aliados"
            icon="🗺️"
            color="blue"
            defaultWidth="max-w-6xl"
            defaultHeight="max-h-[90vh]"
          >
            <ZonificadorMejorado />
          </FloatingModal>
        )}

        {mostrarBusqueda && (
          <BusquedaRapida
            productividad={productividad}
            onSeleccionarOT={handleSeleccionarOT}
            onClose={() => setMostrarBusqueda(false)}
          />
        )}

        {mostrarGuiaEscalamiento && (
          <GuiaEscalamiento onClose={() => setMostrarGuiaEscalamiento(false)} />
        )}
      </div>
    </div>
  );
};

export default AgendamientoOT;
