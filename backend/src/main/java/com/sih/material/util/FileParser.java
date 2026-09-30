package com.sih.material.util;

import java.io.InputStream;
import java.util.List;

public interface FileParser {
    List<ParsedRow> parse(InputStream inputStream);
    boolean supports(String filename);
}
