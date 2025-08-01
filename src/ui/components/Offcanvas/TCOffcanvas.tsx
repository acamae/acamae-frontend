import { Offcanvas } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface TCOffcanvasProps {
  show: boolean;
  onHide: () => void;
}

const TCOffcanvas: React.FC<TCOffcanvasProps> = ({ show, onHide }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en-GB';

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      data-testid="terms-and-conditions-offcanvas">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          {isEnglish ? 'Terms and Conditions' : 'Términos y Condiciones'}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div id="terms-and-conditions">
          {isEnglish ? (
            <>
              <p>
                Welcome to <span>Website Name</span>!
              </p>
              <p>
                These terms and conditions outline the rules and regulations for the use of{' '}
                <span>Company Name</span>'s Website, located at <span>Website.com</span>.
              </p>
              <p>
                By accessing this website we assume you accept these terms and conditions. Do not
                continue to use <span>Website Name</span> if you do not agree to take all of the
                terms and conditions stated on this page.
              </p>
              <p>
                The following terminology applies to these Terms and Conditions, Privacy Statement
                and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you,
                the person log on this website and compliant to the Company's terms and conditions.
                "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party",
                "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the
                offer, acceptance and consideration of payment necessary to undertake the process of
                our assistance to the Client in the most appropriate manner for the express purpose
                of meeting the Client's needs in respect of provision of the Company's stated
                services, in accordance with and subject to, prevailing law of Netherlands. Any use
                of the above terminology or other words in the singular, plural, capitalization
                and/or he/she or they, are taken as interchangeable and therefore as referring to
                same.
              </p>
              <h3>Cookies</h3>
              <p>
                We employ the use of cookies. By accessing <span>Website Name</span>, you agreed to
                use cookies in agreement with the <span>Company Name</span>'s Privacy Policy.
              </p>
              <p>
                Most interactive websites use cookies to let us retrieve the user's details for each
                visit. Cookies are used by our website to enable the functionality of certain areas
                to make it easier for people visiting our website. Some of our affiliate/advertising
                partners may also use cookies.
              </p>
              <h3>License</h3>
              <p>
                Unless otherwise stated, <span>Company Name</span> and/or its licensors own the
                intellectual property rights for all material on <span>Website Name</span>. All
                intellectual property rights are reserved. You may access this from{' '}
                <span>Website Name</span> for your own personal use subjected to restrictions set in
                these terms and conditions.
              </p>
              <p>You must not:</p>
              <ul>
                <li>
                  Republish material from <span>Website Name</span>
                </li>
                <li>
                  Sell, rent or sub-license material from <span>Website Name</span>
                </li>
                <li>
                  Reproduce, duplicate or copy material from <span>Website Name</span>
                </li>
                <li>
                  Redistribute content from <span>Website Name</span>
                </li>
              </ul>
              <p>This Agreement shall begin on the date hereof.</p>
              <p>
                Parts of this website offer an opportunity for users to post and exchange opinions
                and information in certain areas of the website. <span>Company Name</span> does not
                filter, edit, publish or review Comments prior to their presence on the website.
                Comments do not reflect the views and opinions of <span>Company Name</span>,its
                agents and/or affiliates. Comments reflect the views and opinions of the person who
                post their views and opinions. To the extent permitted by applicable laws,{' '}
                <span>Company Name</span> shall not be liable for the Comments or for any liability,
                damages or expenses caused and/or suffered as a result of any use of and/or posting
                of and/or appearance of the Comments on this website.
              </p>
              <p>
                <span>Company Name</span> reserves the right to monitor all Comments and to remove
                any Comments which can be considered inappropriate, offensive or causes breach of
                these Terms and Conditions.
              </p>
              <p>You warrant and represent that:</p>
              <ul>
                <li>
                  You are entitled to post the Comments on our website and have all necessary
                  licenses and consents to do so;
                </li>
                <li>
                  The Comments do not invade any intellectual property right, including without
                  limitation copyright, patent or trademark of any third party;
                </li>
                <li>
                  The Comments do not contain any defamatory, libelous, offensive, indecent or
                  otherwise unlawful material which is an invasion of privacy
                </li>
                <li>
                  The Comments will not be used to solicit or promote business or custom or present
                  commercial activities or unlawful activity.
                </li>
              </ul>
              <p>
                You hereby grant <span>Company Name</span> a non-exclusive license to use,
                reproduce, edit and authorize others to use, reproduce and edit any of your Comments
                in any and all forms, formats or media.
              </p>
              <h3>Hyperlinking to our Content</h3>
              <p>
                The following organizations may link to our Website without prior written approval:
              </p>
              <ul>
                <li>Government agencies;</li>
                <li>Search engines;</li>
                <li>News organizations;</li>
                <li>
                  Online directory distributors may link to our Website in the same manner as they
                  hyperlink to the Websites of other listed businesses; and
                </li>
                <li>
                  System wide Accredited Businesses except soliciting non-profit organizations,
                  charity shopping malls, and charity fundraising groups which may not hyperlink to
                  our Web site.
                </li>
              </ul>
              <p>
                These organizations may link to our home page, to publications or to other Website
                information so long as the link: (a) is not in any way deceptive; (b) does not
                falsely imply sponsorship, endorsement or approval of the linking party and its
                products and/or services; and (c) fits within the context of the linking party's
                site.
              </p>
              <p>
                We may consider and approve other link requests from the following types of
                organizations:
              </p>
              <ul>
                <li>commonly-known consumer and/or business information sources;</li>
                <li>dot.com community sites;</li>
                <li>associations or other groups representing charities;</li>
                <li>online directory distributors;</li>
                <li>internet portals;</li>
                <li>accounting, law and consulting firms; and</li>
                <li>educational institutions and trade associations.</li>
              </ul>
              <p>
                We will approve link requests from these organizations if we decide that: (a) the
                link would not make us look unfavorably to ourselves or to our accredited
                businesses; (b) the organization does not have any negative records with us; (c) the
                benefit to us from the visibility of the hyperlink compensates the absence of{' '}
                <span>Company Name</span>; and (d) the link is in the context of general resource
                information.
              </p>
              <p>
                These organizations may link to our home page so long as the link: (a) is not in any
                way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of
                the linking party and its products or services; and (c) fits within the context of
                the linking party's site.
              </p>
              <p>
                If you are one of the organizations listed in paragraph 2 above and are interested
                in linking to our website, you must inform us by sending an e-mail to{' '}
                <span>Company Name</span>. Please include your name, your organization name, contact
                information as well as the URL of your site, a list of any URLs from which you
                intend to link to our Website, and a list of the URLs on our site to which you would
                like to link. Wait 2-3 weeks for a response.
              </p>
              <p>Approved organizations may hyperlink to our Website as follows:</p>
              <ul>
                <li>By use of our corporate name; or</li>
                <li>By use of the uniform resource locator being linked to; or</li>
                <li>
                  By use of any other description of our Website being linked to that makes sense
                  within the context and format of content on the linking party's site.
                </li>
              </ul>
              <p>
                No use of <span>Company Name</span>'s logo or other artwork will be allowed for
                linking absent a trademark license agreement.
              </p>
              <h3>iFrames</h3>
              <p>
                Without prior approval and written permission, you may not create frames around our
                Webpages that alter in any way the visual presentation or appearance of our Website.
              </p>
              <h3>Content Liability</h3>
              <p>
                We shall not be hold responsible for any content that appears on your Website. You
                agree to protect and defend us against all claims that is rising on your Website. No
                link(s) should appear on any Website that may be interpreted as libelous, obscene or
                criminal, or which infringes, otherwise violates, or advocates the infringement or
                other violation of, any third party rights.
              </p>
              <h3>Reservation of Rights</h3>
              <p>
                We reserve the right to request that you remove all links or any particular link to
                our Website. You approve to immediately remove all links to our Website upon
                request. We also reserve the right to amen these terms and conditions and it's
                linking policy at any time. By continuously linking to our Website, you agree to be
                bound to and follow these linking terms and conditions.
              </p>
              <h3>Removal of links from our website</h3>
              <p>
                If you find any link on our Website that is offensive for any reason, you are free
                to contact and inform us any moment. We will consider requests to remove links but
                we are not obligated to or so or to respond to you directly.
              </p>
              <p>
                We do not ensure that the information on this website is correct, we do not warrant
                its completeness or accuracy; nor do we promise to ensure that the website remains
                available or that the material on the website is kept up to date.
              </p>
              <h3>Disclaimer</h3>
              <p>
                To the maximum extent permitted by applicable law, we exclude all representations,
                warranties and conditions relating to our website and the use of this website.
                Nothing in this disclaimer will:
              </p>
              <ul>
                <li>limit or exclude our or your liability for death or personal injury;</li>
                <li>
                  limit or exclude our or your liability for fraud or fraudulent misrepresentation;
                </li>
                <li>
                  limit any of our or your liabilities in any way that is not permitted under
                  applicable law; or
                </li>
                <li>
                  exclude any of our or your liabilities that may not be excluded under applicable
                  law.
                </li>
              </ul>
              <p>
                The limitations and prohibitions of liability set in this Section and elsewhere in
                this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all
                liabilities arising under the disclaimer, including liabilities arising in contract,
                in tort and for breach of statutory duty.
              </p>
              <p>
                As long as the website and the information and services on the website are provided
                free of charge, we will not be liable for any loss or damage of any nature.
              </p>
            </>
          ) : (
            <>
              <p>
                ¡Bienvenido a <span>Nombre del Sitio</span>!
              </p>
              <p>
                Estos términos y condiciones establecen las reglas y regulaciones para el uso del
                sitio web de <span>Nombre de la Empresa</span>, en <span>SitioWeb.com</span>.
              </p>
              <p>
                Al acceder a este sitio web, asumimos que acepta estos términos y condiciones. No
                continúe utilizando <span>Nombre del Sitio</span> si no está de acuerdo con todos
                los términos y condiciones establecidos en esta página.
              </p>
              <p>
                La siguiente terminología se aplica a estos Términos y Condiciones, Declaración de
                Privacidad y Aviso de Descargo de Responsabilidad y todos los Acuerdos: "Cliente",
                "Usted" y "Su" se refieren a usted, la persona que inicia sesión en este sitio web y
                cumple con los términos y condiciones de la Compañía. "La Compañía", "Nosotros",
                "Nuestro" y "Nos" se refieren a nuestra Compañía. "Parte", "Partes" o "Nosotros" se
                refiere tanto al Cliente como a nosotros mismos.
              </p>
              <h3>Cookies</h3>
              <p>
                Utilizamos cookies. Al acceder a <span>Nombre del Sitio</span>, usted aceptó
                utilizar cookies de acuerdo con la Política de Privacidad de{' '}
                <span>Nombre de la Empresa</span>.
              </p>
              <p>
                La mayoría de los sitios web interactivos utilizan cookies para permitirnos
                recuperar los detalles del usuario para cada visita. Las cookies son utilizadas por
                nuestro sitio web para habilitar la funcionalidad de ciertas áreas y hacer más fácil
                la visita a nuestro sitio web. Algunos de nuestros socios afiliados/publicitarios
                también pueden utilizar cookies.
              </p>
              <h3>Licencia</h3>
              <p>
                A menos que se indique lo contrario, <span>Nombre de la Empresa</span> y/o sus
                licenciantes poseen los derechos de propiedad intelectual de todo el material en{' '}
                <span>Nombre del Sitio</span>. Todos los derechos de propiedad intelectual están
                reservados.
              </p>
              <p>No debe:</p>
              <ul>
                <li>
                  Republicar material de <span>Nombre del Sitio</span>
                </li>
                <li>
                  Vender, alquilar o sublicenciar material de <span>Nombre del Sitio</span>
                </li>
                <li>
                  Reproducir, duplicar o copiar material de <span>Nombre del Sitio</span>
                </li>
                <li>
                  Redistribuir contenido de <span>Nombre del Sitio</span>
                </li>
              </ul>
              <p>Este Acuerdo comenzará en la fecha de hoy.</p>
              <h3>Descargo de Responsabilidad</h3>
              <p>
                En la máxima medida permitida por la ley aplicable, excluimos todas las
                representaciones, garantías y condiciones relacionadas con nuestro sitio web y el
                uso de este sitio web. Nada en este descargo de responsabilidad:
              </p>
              <ul>
                <li>
                  limitará o excluirá nuestra o su responsabilidad por muerte o lesiones personales;
                </li>
                <li>
                  limitará o excluirá nuestra o su responsabilidad por fraude o tergiversación
                  fraudulenta;
                </li>
                <li>
                  limitará cualquiera de nuestras o sus responsabilidades de cualquier manera que no
                  esté permitida por la ley aplicable;
                </li>
                <li>
                  excluirá cualquiera de nuestras o sus responsabilidades que no puedan ser
                  excluidas por la ley aplicable.
                </li>
              </ul>
              <p>
                Mientras el sitio web y la información y servicios en el sitio web se proporcionen
                de forma gratuita, no seremos responsables de ninguna pérdida o daño de cualquier
                naturaleza.
              </p>
            </>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default TCOffcanvas;
