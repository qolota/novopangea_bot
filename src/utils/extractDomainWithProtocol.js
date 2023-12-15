function extractDomainWithProtocol(url) {
    // Remove www subdomain if present
    let domain = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  
    // Remove path and query string
    domain = domain.replace(/\/(.|\n)*$/, '');
  
    // Remove subdomains except for the first one
    domain = domain.split('.').slice(-2).join('.');
  
    // Add the protocol back to the domain
    domain = url.match(/^(https?:\/\/)/)[0] + domain;
  
    return domain;
}

export default extractDomainWithProtocol;