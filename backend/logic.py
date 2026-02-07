def calculate_vrc(data: str, even_parity: bool = True) -> dict:
    """
    Calculates Vertical Redundancy Check (VRC).
    """
    ones = data.count('1')
    if even_parity:
        parity_bit = '1' if ones % 2 != 0 else '0'
    else:
        parity_bit = '0' if ones % 2 != 0 else '1'
    
    return {
        "data": data,
        "parity_type": "Even" if even_parity else "Odd",
        "parity_bit": parity_bit,
        "result": data + parity_bit
    }

def calculate_lrc(data_blocks: list[str], even_parity: bool = True) -> dict:
    """
    Calculates Longitudinal Redundancy Check (LRC).
    Assumes all blocks are of equal length.
    """
    if not data_blocks:
        return {"error": "No data blocks provided"}
    
    length = len(data_blocks[0])
    lrc_bits = []
    
    for i in range(length):
        ones = sum(1 for block in data_blocks if block[i] == '1')
        if even_parity:
            lrc_bits.append('1' if ones % 2 != 0 else '0')
        else:
            lrc_bits.append('0' if ones % 2 != 0 else '1')
            
    lrc_str = "".join(lrc_bits)
    
    return {
        "data_blocks": data_blocks,
        "lrc": lrc_str,
        "result": data_blocks + [lrc_str]
    }

def calculate_crc(data: str, divisor: str) -> dict:
    """
    Calculates Cyclic Redundancy Check (CRC).
    """
    n = len(divisor)
    padded_data = data + '0' * (n - 1)
    
    def xor(a, b):
        result = []
        for i in range(1, len(b)):
            if a[i] == b[i]:
                result.append('0')
            else:
                result.append('1')
        return "".join(result)
    
    pick = padded_data[:n]
    steps = []
    
    tmp = pick
    for i in range(len(data)):
        steps.append({"current_dividend": tmp, "divisor": divisor if tmp[0] == '1' else '0'*n})
        
        if tmp[0] == '1':
            tmp = xor(divisor, tmp) + padded_data[n + i] if n + i < len(padded_data) else xor(divisor, tmp)
        else:
            tmp = xor('0' * n, tmp) + padded_data[n + i] if n + i < len(padded_data) else xor('0' * n, tmp)
            
    remainder = tmp
    codeword = data + remainder
    
    return {
        "data": data,
        "divisor": divisor,
        "remainder": remainder,
        "codeword": codeword,
        "steps": steps
    }

def calculate_checksum(data: str, block_size: int = 8) -> dict:
    """
    Calculates Checksum.
    Splits data into block_size chunks, sums them, wraps carry, takes 1's complement.
    """
    # Pad data if needed
    if len(data) % block_size != 0:
        data = data.zfill((len(data) // block_size + 1) * block_size)
        
    blocks = [data[i:i+block_size] for i in range(0, len(data), block_size)]
    
    current_sum = 0
    steps = []
    
    for block in blocks:
        val = int(block, 2)
        steps.append(f"Add {block} ({val}) to sum {current_sum}")
        current_sum += val
        
        # Handle wrap around immediately or after? usually add all then wrap
        # Standard checksum: sum all, then fold carry
        
    # Handling carry for k-bit checksum
    # While sum > max_val, add carry
    max_val = (1 << block_size) - 1
    
    steps.append(f"Total Sum (raw): {current_sum} ({bin(current_sum)[2:]})")
    
    while current_sum > max_val:
        carry = current_sum >> block_size
        current_sum = (current_sum & max_val) + carry
        steps.append(f"Wrapping carry: new sum = {current_sum} ({bin(current_sum)[2:].zfill(block_size)})")
        
    checksum_int = normalize_bits(~current_sum, block_size)
    checksum_bin = bin(checksum_int)[2:].zfill(block_size)
    
    return {
        "data": data,
        "blocks": blocks,
        "sum": bin(current_sum)[2:].zfill(block_size),
        "checksum": checksum_bin,
        "steps": steps
    }

def normalize_bits(val, width):
    return val & ((1 << width) - 1)

def hamming_encode(data: str) -> dict:
    """
    Hamming Code Encoding (General for any length, using standard placement).
    """
    m = len(data)
    r = 0
    # Calculate number of redundancy bits needed: 2^r >= m + r + 1
    while (1 << r) < (m + r + 1):
        r += 1
        
    total_len = m + r
    codeword = ['0'] * (total_len + 1) # 1-based indexing for easier calc
    
    # Place data bits
    # We place data bits in non-power-of-2 positions.
    
    # 1-based index mapping
    # p1, p2, d3, p4, d5, d6, d7, p8...
    
    data_idx = 0
    parity_indices = []
    
    for i in range(1, total_len + 1):
        if (i & (i - 1)) == 0:
            parity_indices.append(i)
        else:
            if data_idx < len(data):
                codeword[i] = data[data_idx]
                data_idx += 1
    
    # Calculate parity bits on even parity
    steps = []
    
    for p in parity_indices:
        # Check bits where p-th bit is set
        xor_val = 0
        covered_indices = []
        bit_values = []
        
        for i in range(1, total_len + 1):
            if (i & p) == p: # if position i has p bit set
                # Determine bit name based on position
                if (i & (i - 1)) == 0:
                    bit_name = f"p{i}"
                else:
                    bit_name = f"d{i}"
                
                covered_indices.append(bit_name)
                
                val = codeword[i]
                # If it's the parity bit position itself, it's currently 0 placeholder
                if i == p:
                    bit_values.append(f"{bit_name}(?)")
                else:
                    bit_values.append(f"{bit_name}({val})")
                
                if val == '1':
                     xor_val ^= 1
        
        codeword[p] = str(xor_val)
        
        steps.append({
            "parity": f"p{p}",
            "covered": ", ".join(covered_indices),
            "bits_str": " + ".join(bit_values), # e.g. p1(?) + d3(1) + d5(0)
            "result": str(xor_val)
        })
        
    final_code = "".join(codeword[1:])
    
    return {
        "data": data,
        "redundancy_bits": r,
        "total_length": total_len,
        "codeword": final_code,
        "parity_positions": parity_indices,
        "steps": steps
    }
